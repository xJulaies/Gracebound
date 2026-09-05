import mongoose from "mongoose";
import type { SpellData } from "../../../features/spells/domain/spell.types";
import { SpellModel } from "../../../features/spells/models/spell.model";

interface ImportMetadata { gameVersion: string; sourceHash: string }

export async function saveSpellCatalog(spells: SpellData[], metadata: ImportMetadata) {
  if (spells.length === 0) throw new Error("Spell catalog must not be empty");
  if (new Set(spells.map(({ id }) => id)).size !== spells.length) throw new Error("Spell catalog contains duplicate IDs");
  const importedAt = new Date();
  const importedRecords = spells.map((spell) => ({
    ...spell, source: "REGULATION" as const, gameVersion: metadata.gameVersion,
    sourceHash: metadata.sourceHash.toLowerCase(), importedAt,
  }));
  await SpellModel.init();
  const session = await mongoose.startSession();
  try {
    await session.withTransaction(async () => {
      const existingTexts = await SpellModel.find(
        { gameVersion: metadata.gameVersion },
        { id: 1, summary: 1, description: 1 },
        { session },
      ).lean();
      const textsById = new Map(existingTexts.map((spell) => [spell.id, spell]));
      const records = importedRecords.map((record) => {
        const existingText = textsById.get(record.id);
        return {
          ...record,
          summary: record.summary ?? existingText?.summary ?? null,
          description: record.description ?? existingText?.description ?? null,
        };
      });
      await Promise.all(records.map((record) => new SpellModel(record).validate()));
      await SpellModel.deleteMany({ gameVersion: metadata.gameVersion }, { session });
      await SpellModel.insertMany(records, { session });
    });
  } finally {
    await session.endSession();
  }
  return { gameVersion: metadata.gameVersion, spells: importedRecords.length };
}
