import { writeFile } from "node:fs/promises";
import path from "node:path";
import { settings } from "../config/settings";
import { connectMongoDB, disconnectMongoDB } from "../db";
import { loadCatalogIconIds } from "../infrastructure/icons/loadCatalogIconIds";

async function exportIconIds() {
  const output = requiredArgument("--output");
  await connectMongoDB();
  try {
    const iconIds = await loadCatalogIconIds(settings.SUPPORTED_GAME_VERSION);
    await writeFile(output, JSON.stringify(iconIds, null, 2));
    console.log(`Exported ${iconIds.length} unique icon IDs for game version ${settings.SUPPORTED_GAME_VERSION}`);
  } finally {
    await disconnectMongoDB();
  }
}

function requiredArgument(name: string): string {
  const index = process.argv.indexOf(name);
  const value = process.argv[index + 1];
  if (index === -1 || !value || value.startsWith("--")) {
    throw new Error(`Missing required argument ${name}`);
  }
  return path.resolve(value);
}

void exportIconIds().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : "Unknown error";
  console.error(`Icon ID export failed: ${message}`);
  process.exitCode = 1;
});
