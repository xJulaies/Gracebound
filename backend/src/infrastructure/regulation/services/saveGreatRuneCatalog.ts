import mongoose from "mongoose";
import type { GreatRuneData } from "../../../features/greatRunes/domain/greatRune.types";
import { GreatRuneModel } from "../../../features/greatRunes/models/greatRune.model";

interface ImportMetadata {
  gameVersion: string;
  sourceHash: string;
}

export async function saveGreatRuneCatalog(runes: GreatRuneData[], metadata: ImportMetadata) {
  if (runes.length !== 7) {
    throw new Error(`Expected 7 Great Runes, found ${runes.length}`);
  }

  if (new Set(runes.map(({ id }) => id)).size !== runes.length) {
    throw new Error("Great Rune catalog contains duplicate IDs");
  }

  const importedAt = new Date();
  const records = runes.map((rune) => ({
    ...rune,
    source: "REGULATION" as const,
    gameVersion: metadata.gameVersion,
    sourceHash: metadata.sourceHash.toLowerCase(),
    importedAt,
  }));

  await Promise.all(records.map((record) => new GreatRuneModel(record).validate()));
  await GreatRuneModel.init();

  const session = await mongoose.startSession();
  try {
    await session.withTransaction(async () => {
      await GreatRuneModel.deleteMany({ gameVersion: metadata.gameVersion }, { session });
      await GreatRuneModel.insertMany(records, { session });
    });
  } finally {
    await session.endSession();
  }

  return { gameVersion: metadata.gameVersion, greatRunes: records.length };
}
