import path from "node:path";
import { settings } from "../config/settings";
import { connectMongoDB, disconnectMongoDB } from "../db";
import { loadUiAssets } from "../infrastructure/uiAssets/loadUiAssets";
import { saveUiAssets } from "../infrastructure/uiAssets/saveUiAssets";

async function run() {
  const loaded = await loadUiAssets(requiredArgument("--manifest"));
  console.log(`Validated ${loaded.assets.length} UI assets (${(loaded.totalBytes / 1024).toFixed(1)} KiB)`);
  if (process.argv.includes("--dry-run")) {
    console.log("Dry run complete; MongoDB was not changed");
    return;
  }
  try {
    await connectMongoDB();
    const result = await saveUiAssets(loaded.assets, {
      gameVersion: settings.SUPPORTED_GAME_VERSION,
      sourceHash: loaded.sourceHash,
    });
    console.log(`Imported ${result.assets} UI assets for ${result.gameVersion}`);
  } finally {
    await disconnectMongoDB();
  }
}

function requiredArgument(name: string): string {
  const index = process.argv.indexOf(name);
  const value = process.argv[index + 1];
  if (index === -1 || !value || value.startsWith("--")) throw new Error(`Missing required argument ${name}`);
  return path.resolve(value);
}

void run().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : "Unknown error";
  console.error(`UI asset import failed: ${message}`);
  process.exitCode = 1;
});
