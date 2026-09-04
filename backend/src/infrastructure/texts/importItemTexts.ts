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
      });
    } finally {
      await session.endSession();
    }
  }

  return prepared.map(({ result }) => result);
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
