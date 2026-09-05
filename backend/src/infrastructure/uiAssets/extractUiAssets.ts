import { spawn } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import { parseUiAssetLayout, type UiAssetLayoutEntry } from "./uiAssetLayout";

const UI_ASSETS = [
  asset("slot-base", "SB_MainMenu", "MENU_SlotBase"),
  asset("slot-frame", "SB_MainMenu", "MENU_FL_Slot"),
  asset("left-weapon-slot", "SB_MainMenu", "MENU_SL_L_Weapon"),
  asset("right-weapon-slot", "SB_MainMenu", "MENU_SL_R_Weapon"),
  asset("talisman-slot", "SB_MainMenu", "MENU_SL_Talisman"),
  asset("equipment-frame", "SB_FE_01", "MENU_FL_Equip_waku"),
  asset("ash-of-war-frame", "SB_FE_01", "MENU_FL_Arts_waku"),
  asset("equipment-category", "SB_In_GameTop", "MENU_FL_Equipment"),
  asset("magic-category", "SB_In_GameTop", "MENU_FL_Magic"),
  asset("crystal-tear-category", "SB_In_GameTop", "MENU_FL_Elixir"),
  asset("weapon-category", "SB_Tab", "MENU_Tab_Weapon"),
  asset("armor-category", "SB_Tab", "MENU_Tab_Armor"),
  asset("sorcery-category", "SB_Tab", "MENU_Tab_30_PyroxeneMagic"),
  asset("incantation-category", "SB_Tab", "MENU_Tab_31_FaithMagic"),
  asset("ash-of-war-category", "SB_Tab", "MENU_Tab_32_MagicStone"),
] as const;

interface UiAssetDefinition {
  assetId: string;
  atlasName: string;
  textureName: string;
}

export interface UiAssetManifestEntry {
  assetId: string;
  assetFile: string;
  checksum: string;
  width: number;
  height: number;
  size: number;
}

export interface ExtractUiAssetsOptions {
  layoutDirectory: string;
  textureDirectory: string;
  outputDirectory: string;
  texconvPath: string;
  webpQuality?: number;
  convertAtlas?: (atlasName: string, targetDirectory: string) => Promise<string>;
}

export async function extractUiAssets(options: ExtractUiAssetsOptions) {
  const entries = await loadRequestedEntries(options.layoutDirectory);
  const assetsDirectory = path.join(options.outputDirectory, "assets");
  const temporaryDirectory = path.join(options.outputDirectory, ".atlas-cache");
  await rm(assetsDirectory, { recursive: true, force: true });
  await Promise.all([
    mkdir(assetsDirectory, { recursive: true }),
    mkdir(temporaryDirectory, { recursive: true }),
  ]);
  const convertAtlas = options.convertAtlas ?? ((atlasName, targetDirectory) =>
    convertDdsAtlas(options.texconvPath, options.textureDirectory, atlasName, targetDirectory));
  const atlasPaths = new Map<string, string>();
  const manifest: UiAssetManifestEntry[] = [];

  try {
    for (const atlasName of new Set(entries.map(({ layout }) => layout.atlasName))) {
      atlasPaths.set(atlasName, await convertAtlas(atlasName, temporaryDirectory));
    }
    for (const { definition, layout } of entries) {
      const atlasPath = atlasPaths.get(layout.atlasName);
      if (!atlasPath) throw new Error(`Converted atlas ${layout.atlasName} is missing`);
      const data = await sharp(atlasPath)
        .extract({ left: layout.x, top: layout.y, width: layout.width, height: layout.height })
        .webp({ quality: options.webpQuality ?? 90, effort: 4 })
        .toBuffer();
      const checksum = createHash("sha256").update(data).digest("hex");
      const assetFile = `${definition.assetId}.webp`;
      await writeFile(path.join(assetsDirectory, assetFile), data);
      manifest.push({
        assetId: definition.assetId,
        assetFile,
        checksum,
        width: layout.width,
        height: layout.height,
        size: data.length,
      });
    }
  } finally {
    await rm(temporaryDirectory, { recursive: true, force: true });
  }

  const report = {
    extracted: manifest.length,
    totalBytes: manifest.reduce((total, entry) => total + entry.size, 0),
    manifest,
  };
  await writeFile(
    path.join(options.outputDirectory, "manifest.json"),
    JSON.stringify(report, null, 2),
  );
  return report;
}

async function loadRequestedEntries(layoutDirectory: string) {
  const layouts = new Map<string, UiAssetLayoutEntry>();
  for (const atlasName of new Set(UI_ASSETS.map(({ atlasName }) => atlasName))) {
    const source = await readFile(path.join(layoutDirectory, `${atlasName}.layout`), "utf8");
    for (const entry of parseUiAssetLayout(source)) {
      layouts.set(`${entry.atlasName}:${entry.name}`, entry);
    }
  }
  return UI_ASSETS.map((definition) => {
    const layout = layouts.get(`${definition.atlasName}:${definition.textureName}`);
    if (!layout) throw new Error(`Missing UI texture ${definition.textureName}`);
    return { definition, layout };
  });
}

function asset(assetId: string, atlasName: string, textureName: string): UiAssetDefinition {
  return { assetId, atlasName, textureName };
}

function convertDdsAtlas(
  texconvPath: string,
  textureDirectory: string,
  atlasName: string,
  targetDirectory: string,
): Promise<string> {
  const source = path.join(textureDirectory, `${atlasName}.dds`);
  return new Promise((resolve, reject) => {
    const child = spawn(texconvPath, ["-y", "-ft", "png", "-o", targetDirectory, source], {
      stdio: "pipe",
    });
    let errorOutput = "";
    child.stderr.on("data", (chunk: Buffer) => { errorOutput += chunk.toString(); });
    child.on("error", reject);
    child.on("close", (code) => code === 0
      ? resolve(path.join(targetDirectory, `${atlasName}.PNG`))
      : reject(new Error(`Image conversion failed (${code}): ${errorOutput.trim()}`)));
  });
}
