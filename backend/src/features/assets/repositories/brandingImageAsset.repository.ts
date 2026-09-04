import { BrandingImageAssetModel } from "../models/brandingImageAsset.model";

export function findBrandingImageAsset(assetId: string) {
  return BrandingImageAssetModel.findOne({ assetId })
    .select("checksum mimeType size data")
    .exec();
}
