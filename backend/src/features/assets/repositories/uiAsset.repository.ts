import { UiAssetModel } from "../models/uiAsset.model";
import type { UiAssetId } from "../domain/uiAsset.types";

export function findUiAsset(assetId: UiAssetId, gameVersion: string) {
  return UiAssetModel.findOne({ assetId, gameVersion })
    .select("checksum mimeType size data")
    .exec();
}
