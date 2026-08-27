import mongoose from "mongoose";
import type { BossData } from "../../../features/bosses/domain/boss.types";
import { BossModel } from "../../../features/bosses/models/boss.model";

export interface BossImportMetadata {
  gameVersion: string;
  sourceHash: string;
}

export interface BossImportSummary {
  gameVersion: string;
  bosses: number;
}

export async function saveBossDataSet(
  bosses: BossData[],
  metadata: BossImportMetadata,
): Promise<BossImportSummary> {
  if (bosses.length === 0) {
    throw new Error("Boss dataset must not be empty");
  }

  const uniqueIds = new Set(bosses.map(({ id }) => id));

  if (uniqueIds.size !== bosses.length) {
    throw new Error("Boss dataset contains duplicate IDs");
  }

  const importedAt = new Date();
  const records = bosses.map((boss) => ({
    ...boss,
    source: "REGULATION" as const,
    gameVersion: metadata.gameVersion,
    sourceHash: metadata.sourceHash.toLowerCase(),
    importedAt,
  }));

  await Promise.all(records.map((record) => new BossModel(record).validate()));
  await BossModel.init();

  const session = await mongoose.startSession();

  try {
    await session.withTransaction(async () => {
      await BossModel.deleteMany(
        { gameVersion: metadata.gameVersion },
        { session },
      );
      await BossModel.insertMany(records, { session });
    });
  } finally {
    await session.endSession();
  }

  return {
    gameVersion: metadata.gameVersion,
    bosses: bosses.length,
  };
}
