import type { BrandingImageAssetData } from "../../features/assets/domain/brandingImageAsset.types";
import { BrandingImageAssetModel } from "../../features/assets/models/brandingImageAsset.model";

export async function saveBrandingImageAsset(asset: BrandingImageAssetData) {
  const record = { ...asset, importedAt: new Date() };
  await new BrandingImageAssetModel(record).validate();
  await BrandingImageAssetModel.findOneAndReplace(
    { assetId: asset.assetId },
    record,
    { upsert: true },
  );
  return { assetId: asset.assetId, bytes: asset.size };
}
