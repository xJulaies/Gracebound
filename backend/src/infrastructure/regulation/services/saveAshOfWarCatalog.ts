import mongoose from "mongoose";
import type { AshOfWarData } from "../../../features/ashesOfWar/domain/ashOfWar.types";
import { AshOfWarModel } from "../../../features/ashesOfWar/models/ashOfWar.model";

interface ImportMetadata {
  gameVersion: string;
  sourceHash: string;
}

export async function saveAshOfWarCatalog(
  ashes: AshOfWarData[],
  metadata: ImportMetadata,
) {
  if (ashes.length === 0) throw new Error("Ash of War catalog must not be empty");

  const importedAt = new Date();
  const records = ashes.map((ash) => ({
    ...ash,
    source: "REGULATION" as const,
    gameVersion: metadata.gameVersion,
    sourceHash: metadata.sourceHash.toLowerCase(),
    importedAt,
  }));

  await Promise.all(records.map((record) => new AshOfWarModel(record).validate()));
  await AshOfWarModel.init();

  const session = await mongoose.startSession();
  try {
    await session.withTransaction(async () => {
      await AshOfWarModel.deleteMany({ gameVersion: metadata.gameVersion }, { session });
      await AshOfWarModel.insertMany(records, { session });
    });
  } finally {
    await session.endSession();
  }

  return { gameVersion: metadata.gameVersion, ashesOfWar: records.length };
}
