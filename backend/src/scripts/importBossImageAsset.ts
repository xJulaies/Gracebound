import path from "node:path";
import { settings } from "../config/settings";
import { connectMongoDB, disconnectMongoDB } from "../db";
import { prepareBossImageAsset } from "../infrastructure/bossImages/prepareBossImageAsset";
import { saveBossImageAsset } from "../infrastructure/bossImages/saveBossImageAsset";

async function importBossImageAsset() {
  const sourceFilename = requiredArgument("--source");
  const bossId = requiredArgument("--boss-id", false);
  const asset = await prepareBossImageAsset(sourceFilename, bossId);
  console.log(`Prepared ${bossId}: ${asset.width}x${asset.height} WebP (${(asset.size / 1024).toFixed(1)} KiB)`);

  if (process.argv.includes("--dry-run")) {
    console.log("Dry run complete; MongoDB was not changed");
    return;
  }

  try {
    await connectMongoDB();
    await saveBossImageAsset(asset, settings.SUPPORTED_GAME_VERSION);
    console.log(`Imported boss image ${bossId}`);
  } finally {
    await disconnectMongoDB();
  }
}

function requiredArgument(name: string, resolvePath = true) {
  const index = process.argv.indexOf(name);
  const value = process.argv[index + 1];
  if (index === -1 || !value || value.startsWith("--")) {
    throw new Error(`Missing required argument ${name}`);
  }
  return resolvePath ? path.resolve(value) : value;
}

void importBossImageAsset().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : "Unknown error";
  console.error(`Boss image import failed: ${message}`);
  process.exitCode = 1;
});
