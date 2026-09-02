import mongoose from "mongoose";
import type { CrystalTearData } from "../../../features/crystalTears/domain/crystalTear.types";
import { CrystalTearModel } from "../../../features/crystalTears/models/crystalTear.model";

export async function saveCrystalTearCatalog(tears: CrystalTearData[], metadata: { gameVersion: string; sourceHash: string }) {
  if (tears.length !== 32) throw new Error(`Expected 32 Crystal Tears, found ${tears.length}`);
  if (new Set(tears.map(({ id }) => id)).size !== tears.length) throw new Error("Crystal Tear catalog contains duplicate IDs");
  const importedAt = new Date();
  const records = tears.map((tear) => ({ ...tear, source: "REGULATION" as const, gameVersion: metadata.gameVersion, sourceHash: metadata.sourceHash.toLowerCase(), importedAt }));
  await Promise.all(records.map((record) => new CrystalTearModel(record).validate()));
  await CrystalTearModel.init();
  const session = await mongoose.startSession();
  try {
    await session.withTransaction(async () => {
      await CrystalTearModel.deleteMany({ gameVersion: metadata.gameVersion }, { session });
      await CrystalTearModel.insertMany(records, { session });
    });
  } finally { await session.endSession(); }
  return { crystalTears: records.length, gameVersion: metadata.gameVersion };
}
