import mongoose from "mongoose";
import type { CharacterClassData } from "../../../features/characterClasses/domain/characterClass.types";
import { CharacterClassModel } from "../../../features/characterClasses/models/characterClass.model";
import type { CharacterProgressionCurves } from "../../../features/builds/domain/characterResources.types";
import { CharacterProgressionModel } from "../../../features/characterClasses/models/characterProgression.model";

interface ImportMetadata {
  gameVersion: string;
  sourceHash: string;
}

export async function saveCharacterClassCatalog(
  classes: CharacterClassData[],
  curves: CharacterProgressionCurves,
  metadata: ImportMetadata,
) {
  if (classes.length !== 10) throw new Error(`Expected 10 character classes, received ${classes.length}`);
  if (new Set(classes.map(({ id }) => id)).size !== classes.length) {
    throw new Error("Character class catalog contains duplicate IDs");
  }

  const importedAt = new Date();
  const records = classes.map((entry) => ({
    ...entry,
    source: "REGULATION" as const,
    gameVersion: metadata.gameVersion,
    sourceHash: metadata.sourceHash.toLowerCase(),
    importedAt,
  }));
  const progressionRecord = {
    id: "character-resources" as const,
    curves,
    source: "REGULATION" as const,
    gameVersion: metadata.gameVersion,
    sourceHash: metadata.sourceHash.toLowerCase(),
    importedAt,
  };
  await Promise.all(records.map((record) => new CharacterClassModel(record).validate()));
  await new CharacterProgressionModel(progressionRecord).validate();
  await Promise.all([CharacterClassModel.init(), CharacterProgressionModel.init()]);

  const session = await mongoose.startSession();
  try {
    await session.withTransaction(async () => {
      await CharacterClassModel.deleteMany({ gameVersion: metadata.gameVersion }, { session });
      await CharacterProgressionModel.deleteMany({ gameVersion: metadata.gameVersion }, { session });
      await CharacterClassModel.insertMany(records, { session });
      await CharacterProgressionModel.create([progressionRecord], { session });
    });
  } finally {
    await session.endSession();
  }
  return { gameVersion: metadata.gameVersion, characterClasses: records.length };
}
