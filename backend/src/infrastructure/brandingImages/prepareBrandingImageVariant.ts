import { createHash } from "node:crypto";
import sharp from "sharp";
import type {
  BrandingAssetId,
  BrandingImageAssetData,
} from "../../features/assets/domain/brandingImageAsset.types";

interface BrandingVariantDefinition {
  assetId: BrandingAssetId;
  width: number;
  height: number;
  quality: number;
}

export async function prepareBrandingImageVariant(
  source: Pick<BrandingImageAssetData, "data" | "sourceHash">,
  definition: BrandingVariantDefinition,
): Promise<BrandingImageAssetData> {
  const data = await sharp(source.data)
    .resize(definition.width, definition.height, {
      fit: "cover",
      position: "centre",
    })
    .webp({ quality: definition.quality })
    .toBuffer();
  const metadata = await sharp(data).metadata();

  if (
    metadata.format !== "webp" ||
    metadata.width !== definition.width ||
    metadata.height !== definition.height
  ) {
    throw new Error(`Failed to prepare branding variant ${definition.assetId}`);
  }

  return {
    assetId: definition.assetId,
    checksum: createHash("sha256").update(data).digest("hex"),
    mimeType: "image/webp",
    width: definition.width,
    height: definition.height,
    size: data.length,
    data,
    sourceHash: source.sourceHash,
  };
}
