import mongoose from "mongoose";
import type { ItemTextCatalogs, ItemTextEntry } from "./parseSmithboxTextExport";

interface CatalogResult {
  collection: string;
  records: number;
  matched: number;
  withSummary: number;
  withDescription: number;
}

interface CatalogConfiguration {
  collection: string;
  sourceIdField: string;
  texts: Map<number, ItemTextEntry>;
}

export async function importItemTexts(
  catalogs: ItemTextCatalogs,
  gameVersion: string,
  dryRun = false,
): Promise<CatalogResult[]> {
  const configurations: CatalogConfiguration[] = [
    { collection: "weapons", sourceIdField: "sourceId", texts: catalogs.weapons },
    { collection: "armor", sourceIdField: "sourceProtectorId", texts: catalogs.armor },
    { collection: "talismans", sourceIdField: "sourceAccessoryId", texts: catalogs.talismans },
    { collection: "spells", sourceIdField: "sourceMagicId", texts: catalogs.goods },
    { collection: "ashesOfWar", sourceIdField: "sourceGemId", texts: catalogs.ashesOfWar },
    { collection: "greatRunes", sourceIdField: "sourceGoodsId", texts: catalogs.goods },
    { collection: "crystalTears", sourceIdField: "sourceGoodsId", texts: catalogs.goods },
  ];
  const prepared = await Promise.all(
    configurations.map((configuration) => prepareCatalog(configuration, gameVersion)),
  );
  const preparedSkills = await prepareWeaponSkills(catalogs.skills, gameVersion);

  if (!dryRun) {
    const session = await mongoose.startSession();
    try {
      await session.withTransaction(async () => {
        for (const { configuration, operations } of prepared) {
          if (operations.length > 0) {
            await mongoose.connection.collection(configuration.collection).bulkWrite(
              operations,
              { session },
            );
          }
        }
        if (preparedSkills.operations.length > 0) {
          await mongoose.connection.collection("weapons").bulkWrite(
            preparedSkills.operations,
            { session },
          );
        }
      });
    } finally {
      await session.endSession();
    }
  }

  return [...prepared.map(({ result }) => result), preparedSkills.result];
}

async function prepareWeaponSkills(
  texts: Map<number, ItemTextEntry>,
  gameVersion: string,
) {
  const collection = mongoose.connection.collection("weapons");
  const records = await collection.find(
    { gameVersion, "skills.0": { $exists: true } },
    { projection: { _id: 1, skills: 1 } },
  ).toArray();
  let matched = 0;
  let withSummary = 0;
  let withDescription = 0;
  const operations = records.flatMap((record) => {
    if (!Array.isArray(record.skills)) return [];
    let changed = false;
    const skills = record.skills.map((skill: Record<string, unknown>) => {
      const sourceSwordArtId = skill.sourceSwordArtId;
      const text = typeof sourceSwordArtId === "number"
        ? texts.get(sourceSwordArtId)
        : undefined;
      if (!text) return skill;
      matched += 1;
      if (text.summary) withSummary += 1;
      if (text.description) withDescription += 1;
      changed = changed || Boolean(text.summary || text.description);
      return {
        ...skill,
        summary: text.summary,
        description: text.description,
      };
    });

    return changed
      ? [{ updateOne: { filter: { _id: record._id }, update: { $set: { skills } } } }]
      : [];
  });

  return {
    operations,
    result: {
      collection: "weaponSkills",
      records: records.reduce(
        (total, record) => total + (Array.isArray(record.skills) ? record.skills.length : 0),
        0,
      ),
      matched,
      withSummary,
      withDescription,
    },
  };
}

async function prepareCatalog(
  configuration: CatalogConfiguration,
  gameVersion: string,
) {
  const collection = mongoose.connection.collection(configuration.collection);
  const records = await collection.find(
    { gameVersion },
    { projection: { _id: 1, [configuration.sourceIdField]: 1 } },
  ).toArray();
  const operations = records.flatMap((record) => {
    const sourceId = record[configuration.sourceIdField];
    if (typeof sourceId !== "number") return [];
    const text = configuration.texts.get(sourceId);
    if (!text?.summary && !text?.description) return [];
    return [{
      updateOne: {
        filter: { _id: record._id },
        update: { $set: { summary: text.summary, description: text.description } },
      },
    }];
  });
  const matchedTexts = records.flatMap((record) => {
    const sourceId = record[configuration.sourceIdField];
    const text = typeof sourceId === "number" ? configuration.texts.get(sourceId) : undefined;
    return text ? [text] : [];
  });

  return {
    configuration,
    operations,
    result: {
      collection: configuration.collection,
      records: records.length,
      matched: matchedTexts.length,
      withSummary: matchedTexts.filter(({ summary }) => summary).length,
      withDescription: matchedTexts.filter(({ description }) => description).length,
    },
  };
}
