import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import sharp from "sharp";
import type { BrandingImageAssetData } from "../../features/assets/domain/brandingImageAsset.types";

const BRANDING_ASSETS = {
  "gracebound-hero": { width: 1200, height: 1200 },
  "gracebound-hero-desktop": { width: 2048, height: 1152 },
  "gracebound-navbar-logo": { width: 900, height: 300 },
} as const;

export type BrandingAssetId = keyof typeof BRANDING_ASSETS;

export async function prepareBrandingImageAsset(
  sourceFilename: string,
  assetId: BrandingAssetId = "gracebound-hero",
): Promise<BrandingImageAssetData> {
  const source = await readFile(sourceFilename);
  const dimensions = BRANDING_ASSETS[assetId];
  const data = await sharp(source)
    .resize(dimensions.width, dimensions.height, {
      fit: "cover",
      withoutEnlargement: assetId !== "gracebound-hero-desktop",
    })
    .webp({ quality: 86 })
    .toBuffer();
  const metadata = await sharp(data).metadata();
  if (metadata.format !== "webp" || !metadata.width || !metadata.height) {
    throw new Error("Failed to prepare the Gracebound hero as WebP");
  }
  if (data.length > 2_097_152) throw new Error("Gracebound hero exceeds 2 MiB");

  return {
    assetId,
    checksum: createHash("sha256").update(data).digest("hex"),
    mimeType: "image/webp",
    width: metadata.width,
    height: metadata.height,
    size: data.length,
    data,
    sourceHash: createHash("sha256").update(source).digest("hex"),
  };
}
