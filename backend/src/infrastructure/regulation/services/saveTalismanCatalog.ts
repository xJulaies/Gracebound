import mongoose from "mongoose";
import type { TalismanData } from "../../../features/talismans/domain/talisman.types";
import { TalismanModel } from "../../../features/talismans/models/talisman.model";

interface ImportMetadata {
  gameVersion: string;
  sourceHash: string;
}

export async function saveTalismanCatalog(talismans: TalismanData[], metadata: ImportMetadata) {
  if (talismans.length === 0) throw new Error("Talisman catalog must not be empty");
  if (new Set(talismans.map(({ id }) => id)).size !== talismans.length) {
    throw new Error("Talisman catalog contains duplicate IDs");
  }

  const importedAt = new Date();
  const records = talismans.map((talisman) => ({
    ...talisman,
    source: "REGULATION" as const,
    gameVersion: metadata.gameVersion,
    sourceHash: metadata.sourceHash.toLowerCase(),
    importedAt,
  }));

  await Promise.all(records.map((record) => new TalismanModel(record).validate()));
  await TalismanModel.init();
  const session = await mongoose.startSession();
  try {
    await session.withTransaction(async () => {
      await TalismanModel.deleteMany({ gameVersion: metadata.gameVersion }, { session });
      await TalismanModel.insertMany(records, { session });
    });
  } finally {
    await session.endSession();
  }
  return { gameVersion: metadata.gameVersion, talismans: records.length };
}
