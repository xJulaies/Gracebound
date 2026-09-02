import mongoose from "mongoose";
import type { CharacterClassImageAssetData } from "../../features/assets/domain/characterClassImageAsset.types";
import { CharacterClassImageAssetModel } from "../../features/assets/models/characterClassImageAsset.model";

interface CharacterClassImageImportMetadata {
  gameVersion: string;
  sourceHash: string;
}

export async function saveCharacterClassImageAssets(
  assets: CharacterClassImageAssetData[],
  metadata: CharacterClassImageImportMetadata,
) {
  if (assets.length !== 10) throw new Error("Expected exactly 10 character class images");
  const classIds = assets.map(({ classId }) => classId);
  if (new Set(classIds).size !== assets.length) {
    throw new Error("Character class image catalog contains duplicate classes");
  }
  const importedAt = new Date();
  const records = assets.map((asset) => ({ ...asset, ...metadata, importedAt }));
  await Promise.all(
    records.map((record) => new CharacterClassImageAssetModel(record).validate()),
  );
  await CharacterClassImageAssetModel.init();
  const session = await mongoose.startSession();
  try {
    await session.withTransaction(async () => {
      await CharacterClassImageAssetModel.deleteMany(
        { gameVersion: metadata.gameVersion },
        { session },
      );
      await CharacterClassImageAssetModel.insertMany(records, { session });
    });
  } finally {
    await session.endSession();
  }
  return { gameVersion: metadata.gameVersion, assets: records.length };
}
