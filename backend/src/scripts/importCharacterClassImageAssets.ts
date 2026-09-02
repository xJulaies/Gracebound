import path from "node:path";
import { settings } from "../config/settings";
import { connectMongoDB, disconnectMongoDB } from "../db";
import { loadCharacterClassImageAssets } from "../infrastructure/classImages/loadCharacterClassImageAssets";
import { saveCharacterClassImageAssets } from "../infrastructure/classImages/saveCharacterClassImageAssets";

async function importCharacterClassImageAssets() {
  const manifestFilename = requiredArgument("--manifest");
  const loaded = await loadCharacterClassImageAssets(manifestFilename);
  console.log(
    `Validated ${loaded.assets.length} character class images (${(loaded.totalBytes / 1_048_576).toFixed(2)} MiB)`,
  );
  if (process.argv.includes("--dry-run")) {
    console.log("Dry run complete; MongoDB was not changed");
    return;
  }
  try {
    await connectMongoDB();
    const summary = await saveCharacterClassImageAssets(loaded.assets, {
      gameVersion: settings.SUPPORTED_GAME_VERSION,
      sourceHash: loaded.sourceHash,
    });
    console.log(`Imported ${summary.assets} character class images`);
  } finally {
    await disconnectMongoDB();
  }
}

function requiredArgument(name: string) {
  const index = process.argv.indexOf(name);
  const value = process.argv[index + 1];
  if (index === -1 || !value || value.startsWith("--")) {
    throw new Error(`Missing required argument ${name}`);
  }
  return path.resolve(value);
}

void importCharacterClassImageAssets().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : "Unknown error";
  console.error(`Character class image import failed: ${message}`);
  process.exitCode = 1;
});
