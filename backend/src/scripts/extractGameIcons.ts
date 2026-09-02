import { readFile } from "node:fs/promises";
import path from "node:path";
import { z } from "zod";
import { extractIcons } from "../infrastructure/icons/extractIcons";

const iconIdsSchema = z.array(z.number().int().nonnegative());

async function extractGameIcons() {
  const idsFile = requiredArgument("--ids");
  const rawDirectory = requiredArgument("--raw");
  const outputDirectory = requiredArgument("--output");
  const texconvPath = requiredArgument("--texconv");
  const iconIds = iconIdsSchema.parse(JSON.parse(await readFile(idsFile, "utf8")));
  const report = await extractIcons({
    iconIds,
    layoutDirectory: path.join(rawDirectory, "01_common-sblytbnd-dcx"),
    textureDirectory: path.join(rawDirectory, "01_common-tpf-dcx"),
    outputDirectory,
    texconvPath,
  });

  console.log(`Requested icons: ${report.requested}`);
  console.log(`Extracted mappings: ${report.extracted}`);
  console.log(`Unique images: ${report.uniqueAssets}`);
  console.log(`Duplicate images removed: ${report.duplicateImages}`);
  console.log(`Missing icon IDs: ${report.missingIconIds.length}`);
  console.log(`WebP storage: ${(report.totalBytes / 1_000_000).toFixed(2)} MB`);
}

function requiredArgument(name: string): string {
  const index = process.argv.indexOf(name);
  const value = process.argv[index + 1];
  if (index === -1 || !value || value.startsWith("--")) {
    throw new Error(`Missing required argument ${name}`);
  }
  return path.resolve(value);
}

void extractGameIcons().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : "Unknown error";
  console.error(`Icon extraction failed: ${message}`);
  process.exitCode = 1;
});
