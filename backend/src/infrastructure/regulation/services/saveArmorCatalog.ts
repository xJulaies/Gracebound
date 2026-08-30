import mongoose from "mongoose";
import type { ArmorData } from "../../../features/armor/domain/armor.types";
import { ArmorModel } from "../../../features/armor/models/armor.model";

interface ImportMetadata { gameVersion: string; sourceHash: string }

export async function saveArmorCatalog(armor: ArmorData[], metadata: ImportMetadata) {
  if (armor.length === 0) throw new Error("Armor catalog must not be empty");
  if (new Set(armor.map(({ id }) => id)).size !== armor.length) throw new Error("Armor catalog contains duplicate IDs");

  const importedAt = new Date();
  const records = armor.map((item) => ({
    ...item,
    source: "REGULATION" as const,
    gameVersion: metadata.gameVersion,
    sourceHash: metadata.sourceHash.toLowerCase(),
    importedAt,
  }));
  await Promise.all(records.map((record) => new ArmorModel(record).validate()));
  await ArmorModel.init();
  const session = await mongoose.startSession();
  try {
    await session.withTransaction(async () => {
      await ArmorModel.deleteMany({ gameVersion: metadata.gameVersion }, { session });
      await ArmorModel.insertMany(records, { session });
    });
  } finally {
    await session.endSession();
  }
  return { gameVersion: metadata.gameVersion, armor: records.length };
}
