import path from "node:path";
import { connectMongoDB, disconnectMongoDB } from "../db";
import {
  prepareBrandingImageAsset,
  type BrandingAssetId,
} from "../infrastructure/brandingImages/prepareBrandingImageAsset";
import { saveBrandingImageAsset } from "../infrastructure/brandingImages/saveBrandingImageAsset";

async function importBrandingImageAsset() {
  const sourceFilename = requiredArgument("--source");
  const assetId = optionalArgument("--asset-id") ?? "gracebound-hero";
  if (
    assetId !== "gracebound-hero" &&
    assetId !== "gracebound-hero-desktop" &&
    assetId !== "gracebound-navbar-logo"
  ) {
    throw new Error(`Unsupported branding asset ID: ${assetId}`);
  }
  const asset = await prepareBrandingImageAsset(
    sourceFilename,
    assetId as BrandingAssetId,
  );
  console.log(
    `Prepared ${asset.width}x${asset.height} WebP (${(asset.size / 1024).toFixed(1)} KiB)`,
  );
  if (process.argv.includes("--dry-run")) {
    console.log("Dry run complete; MongoDB was not changed");
    return;
  }
  try {
    await connectMongoDB();
    const summary = await saveBrandingImageAsset(asset);
    console.log(`Imported branding image ${summary.assetId}`);
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

function optionalArgument(name: string) {
  const index = process.argv.indexOf(name);
  const value = process.argv[index + 1];
  return index === -1 || !value || value.startsWith("--") ? undefined : value;
}

void importBrandingImageAsset().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : "Unknown error";
  console.error(`Branding image import failed: ${message}`);
  process.exitCode = 1;
});
