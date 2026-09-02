import { IconAssetModel } from "../models/iconAsset.model";

export function findIconAssetById(iconId: number, gameVersion: string) {
  return IconAssetModel.findOne({ gameVersion, iconIds: iconId })
    .select("checksum mimeType size data")
    .exec();
}
