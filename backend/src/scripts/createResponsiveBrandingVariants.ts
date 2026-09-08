import { connectMongoDB, disconnectMongoDB } from "../db";
import type { BrandingAssetId } from "../features/assets/domain/brandingImageAsset.types";
import { BrandingImageAssetModel } from "../features/assets/models/brandingImageAsset.model";
import { prepareBrandingImageVariant } from "../infrastructure/brandingImages/prepareBrandingImageVariant";
import { saveBrandingImageAsset } from "../infrastructure/brandingImages/saveBrandingImageAsset";

interface VariantDefinition {
  sourceAssetId: BrandingAssetId;
  assetId: BrandingAssetId;
  width: number;
  height: number;
  quality: number;
}

const VARIANTS: VariantDefinition[] = [
  {
    sourceAssetId: "gracebound-hero",
    assetId: "gracebound-hero-mobile",
    width: 480,
    height: 667,
    quality: 78,
  },
  {
    sourceAssetId: "gracebound-navbar-logo",
    assetId: "gracebound-navbar-logo-compact",
    width: 416,
    height: 139,
    quality: 82,
  },
  {
    sourceAssetId: "gracebound-background-grace",
    assetId: "gracebound-background-grace-mobile",
    width: 768,
    height: 1366,
    quality: 68,
  },
  {
    sourceAssetId: "gracebound-background-night",
    assetId: "gracebound-background-night-mobile",
    width: 768,
    height: 1366,
    quality: 68,
  },
];

async function createResponsiveBrandingVariants() {
  try {
    await connectMongoDB();
    for (const definition of VARIANTS) {
      const source = await BrandingImageAssetModel.findOne({
        assetId: definition.sourceAssetId,
      })
        .select("data sourceHash")
        .exec();
      if (!source) throw new Error(`Missing source asset ${definition.sourceAssetId}`);

      const variant = await prepareBrandingImageVariant(source, definition);
      await saveBrandingImageAsset(variant);
      console.log(
        `Prepared ${variant.assetId}: ${variant.width}x${variant.height}, ${(variant.size / 1024).toFixed(1)} KiB`,
      );
    }
  } finally {
    await disconnectMongoDB();
  }
}

void createResponsiveBrandingVariants().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : "Unknown error";
  console.error(`Responsive branding variant creation failed: ${message}`);
  process.exitCode = 1;
});
