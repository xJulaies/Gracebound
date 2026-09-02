import { createHash } from "node:crypto";
import { mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { spawn } from "node:child_process";
import sharp from "sharp";
import { indexIconLayouts, parseIconLayout, type IconLayoutEntry } from "./iconLayout";

export interface ExtractIconsOptions {
  iconIds: number[];
  layoutDirectory: string;
  textureDirectory: string;
  outputDirectory: string;
  texconvPath: string;
  webpQuality?: number;
  convertAtlas?: (atlasName: string, targetDirectory: string) => Promise<string>;
}

export interface IconManifestEntry {
  iconId: number;
  assetFile: string;
  checksum: string;
  width: number;
  height: number;
  size: number;
}

export interface IconExtractionReport {
  requested: number;
  extracted: number;
  missingIconIds: number[];
  uniqueAssets: number;
  duplicateImages: number;
  totalBytes: number;
  manifest: IconManifestEntry[];
}

export async function extractIcons(options: ExtractIconsOptions): Promise<IconExtractionReport> {
  const quality = options.webpQuality ?? 90;
  const iconIds = [...new Set(options.iconIds)].sort((left, right) => left - right);
  const layouts = await loadLayouts(options.layoutDirectory);
  const requestedEntries = iconIds
    .map((iconId) => layouts.get(iconId))
    .filter((entry): entry is IconLayoutEntry => entry !== undefined);
  const missingIconIds = iconIds.filter((iconId) => !layouts.has(iconId));
  const assetsDirectory = path.join(options.outputDirectory, "assets");
  const temporaryDirectory = path.join(options.outputDirectory, ".atlas-cache");
  await rm(assetsDirectory, { recursive: true, force: true });
  await Promise.all([mkdir(assetsDirectory, { recursive: true }), mkdir(temporaryDirectory, { recursive: true })]);

  const convertAtlas = options.convertAtlas ?? ((atlasName, targetDirectory) =>
    convertDdsAtlas(options.texconvPath, options.textureDirectory, atlasName, targetDirectory));
  const atlasPaths = new Map<string, string>();
  let manifest: IconManifestEntry[];

  try {
    const atlasNames = [...new Set(requestedEntries.map(({ atlasName }) => atlasName))];
    for (const atlasName of atlasNames) {
      atlasPaths.set(atlasName, await convertAtlas(atlasName, temporaryDirectory));
    }
    const extracted = await mapWithConcurrency(requestedEntries, 4, async (entry) => {
      const atlasPath = atlasPaths.get(entry.atlasName);
      if (!atlasPath) throw new Error(`Converted atlas ${entry.atlasName} is missing`);
      const webp = await sharp(atlasPath)
        .extract({ left: entry.x, top: entry.y, width: entry.width, height: entry.height })
        .webp({ quality, effort: 4 })
        .toBuffer();
      const checksum = createHash("sha256").update(webp).digest("hex");
      return { entry, webp, checksum };
    });
    const assets = new Map<string, Buffer>();
    for (const { checksum, webp } of extracted) assets.set(checksum, webp);
    await Promise.all([...assets].map(([checksum, webp]) =>
      writeFile(path.join(assetsDirectory, `${checksum}.webp`), webp)));
    manifest = extracted.map(({ entry, webp, checksum }) => ({
      iconId: entry.iconId,
      assetFile: `${checksum}.webp`,
      checksum,
      width: entry.width,
      height: entry.height,
      size: webp.length,
    }));
  } finally {
    await rm(temporaryDirectory, { recursive: true, force: true });
  }

  const uniqueAssetSizes = new Map(manifest.map(({ checksum, size }) => [checksum, size]));
  const report: IconExtractionReport = {
    requested: iconIds.length,
    extracted: manifest.length,
    missingIconIds,
    uniqueAssets: uniqueAssetSizes.size,
    duplicateImages: manifest.length - uniqueAssetSizes.size,
    totalBytes: [...uniqueAssetSizes.values()].reduce((total, size) => total + size, 0),
    manifest,
  };
  await writeFile(path.join(options.outputDirectory, "manifest.json"), JSON.stringify(report, null, 2));
  return report;
}

async function mapWithConcurrency<Input, Output>(
  values: Input[],
  concurrency: number,
  mapper: (value: Input) => Promise<Output>,
): Promise<Output[]> {
  const output = new Array<Output>(values.length);
  let nextIndex = 0;
  async function worker() {
    while (nextIndex < values.length) {
      const index = nextIndex++;
      output[index] = await mapper(values[index]);
    }
  }
  await Promise.all(Array.from({ length: Math.min(concurrency, values.length) }, worker));
  return output;
}

async function loadLayouts(directory: string): Promise<Map<number, IconLayoutEntry>> {
  const filenames = (await readdir(directory)).filter((filename) => filename.endsWith(".layout"));
  const contents = await Promise.all(
    filenames.map((filename) => readFile(path.join(directory, filename), "utf8")),
  );
  return indexIconLayouts(contents.flatMap(parseIconLayout));
}

async function convertDdsAtlas(
  texconvPath: string,
  textureDirectory: string,
  atlasName: string,
  targetDirectory: string,
): Promise<string> {
  const source = path.join(textureDirectory, `${atlasName}.dds`);
  await run(texconvPath, ["-y", "-ft", "png", "-o", targetDirectory, source]);
  return path.join(targetDirectory, `${atlasName}.PNG`);
}

function run(command: string, arguments_: string[]): Promise<void> {
  return new Promise((resolve, reject) => {
    const child = spawn(command, arguments_, { stdio: "pipe" });
    let errorOutput = "";
    child.stderr.on("data", (chunk: Buffer) => { errorOutput += chunk.toString(); });
    child.on("error", reject);
    child.on("close", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`Image conversion failed (${code}): ${errorOutput.trim()}`));
    });
  });
}
