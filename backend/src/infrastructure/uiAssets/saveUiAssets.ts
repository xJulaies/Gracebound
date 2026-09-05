import mongoose from "mongoose";
import type { UiAssetData } from "../../features/assets/domain/uiAsset.types";
import { UI_ASSET_IDS } from "../../features/assets/domain/uiAsset.types";
import { UiAssetModel } from "../../features/assets/models/uiAsset.model";

interface Metadata { gameVersion: string; sourceHash: string }

export async function saveUiAssets(assets: UiAssetData[], metadata: Metadata) {
  if (assets.length !== UI_ASSET_IDS.length) throw new Error(`Expected exactly ${UI_ASSET_IDS.length} UI assets`);
  if (new Set(assets.map(({ assetId }) => assetId)).size !== assets.length) {
    throw new Error("UI asset catalog contains duplicate IDs");
  }
  const importedAt = new Date();
  const records = assets.map((asset) => ({ ...asset, ...metadata, importedAt }));
  await Promise.all(records.map((record) => new UiAssetModel(record).validate()));
  await UiAssetModel.init();
  const session = await mongoose.startSession();
  try {
    await session.withTransaction(async () => {
      await UiAssetModel.deleteMany({ gameVersion: metadata.gameVersion }, { session });
      await UiAssetModel.insertMany(records, { session });
    });
  } finally {
    await session.endSession();
  }
  return { gameVersion: metadata.gameVersion, assets: records.length };
}
