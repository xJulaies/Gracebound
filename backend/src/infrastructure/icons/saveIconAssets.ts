import mongoose from "mongoose";
import type { IconAssetData } from "../../features/assets/domain/iconAsset.types";
import { IconAssetModel } from "../../features/assets/models/iconAsset.model";

interface IconImportMetadata {
  gameVersion: string;
  sourceHash: string;
}

export async function saveIconAssets(assets: IconAssetData[], metadata: IconImportMetadata) {
  if (assets.length === 0) throw new Error("Icon asset catalog must not be empty");
  const iconIds = assets.flatMap(({ iconIds: ids }) => ids);
  if (new Set(iconIds).size !== iconIds.length) throw new Error("Icon asset catalog contains duplicate IDs");
  const importedAt = new Date();
  const records = assets.map((asset) => ({ ...asset, ...metadata, importedAt }));
  await Promise.all(records.map((record) => new IconAssetModel(record).validate()));
  await IconAssetModel.init();
  const session = await mongoose.startSession();
  try {
    await session.withTransaction(async () => {
      await IconAssetModel.deleteMany({ gameVersion: metadata.gameVersion }, { session });
      await IconAssetModel.insertMany(records, { session });
    });
  } finally {
    await session.endSession();
  }
  return { gameVersion: metadata.gameVersion, assets: records.length, iconIds: iconIds.length };
}
