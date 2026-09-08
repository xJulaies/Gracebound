import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import sharp from "sharp";
import type {
  BrandingAssetId,
  BrandingImageAssetData,
} from "../../features/assets/domain/brandingImageAsset.types";

const BRANDING_ASSETS = {
  "gracebound-hero": { width: 1200, height: 1200, quality: 86 },
  "gracebound-hero-mobile": { width: 480, height: 667, quality: 78 },
  "gracebound-hero-desktop": { width: 2048, height: 1152, quality: 86 },
  "gracebound-navbar-logo": { width: 900, height: 300, quality: 86 },
  "gracebound-navbar-logo-compact": { width: 416, height: 139, quality: 82 },
  "gracebound-background-grace": { width: 2560, height: 1440, quality: 86 },
  "gracebound-background-grace-mobile": { width: 768, height: 1366, quality: 68 },
  "gracebound-background-night": { width: 1920, height: 1080, quality: 86 },
  "gracebound-background-night-mobile": { width: 768, height: 1366, quality: 68 },
} satisfies Record<BrandingAssetId, { width: number; height: number; quality: number }>;

export async function prepareBrandingImageAsset(
  sourceFilename: string,
  assetId: BrandingAssetId = "gracebound-hero",
): Promise<BrandingImageAssetData> {
  const source = await readFile(sourceFilename);
  const dimensions = BRANDING_ASSETS[assetId];
  const data = await sharp(source)
    .resize(dimensions.width, dimensions.height, {
      fit: "cover",
      withoutEnlargement:
        assetId !== "gracebound-hero-desktop" &&
        !assetId.startsWith("gracebound-background-"),
    })
    .webp({ quality: dimensions.quality })
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
