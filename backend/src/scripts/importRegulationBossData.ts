import { createHash } from "node:crypto";
import { createReadStream } from "node:fs";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { settings } from "../config/settings";
import { connectMongoDB, disconnectMongoDB } from "../db";
import { mvpBossDefinitions } from "../infrastructure/regulation/data/mvpBossDefinitions";
import { mapRegulationBosses } from "../infrastructure/regulation/mappers/mapRegulationBoss";
import { parseNpcParamCsv } from "../infrastructure/regulation/parsers/parseNpcParamCsv";
import { parseSpEffectParamCsv } from "../infrastructure/regulation/parsers/parseSpEffectParamCsv";
import { saveBossDataSet } from "../infrastructure/regulation/services/saveBossDataSet";

const REQUIRED_EXPORTS = {
  npcs: "NpcParam.csv",
  effects: "SpEffectParam.csv",
} as const;

async function importRegulationBossData() {
  const exportDirectory = requiredArgument("--exports");
  const regulationFile = requiredArgument("--regulation");
  const [npcCsv, effectCsv, sourceHash] = await Promise.all([
    readExport(exportDirectory, REQUIRED_EXPORTS.npcs),
    readExport(exportDirectory, REQUIRED_EXPORTS.effects),
    sha256(regulationFile),
  ]);
  const bosses = mapRegulationBosses(
    mvpBossDefinitions,
    parseNpcParamCsv(npcCsv),
    parseSpEffectParamCsv(effectCsv),
  );

  console.log(`Validated ${bosses.length} Regulation bosses`);

  if (process.argv.includes("--dry-run")) {
    console.log("Dry run complete; MongoDB was not changed");
    return;
  }

  try {
    await connectMongoDB();
    const summary = await saveBossDataSet(bosses, {
      gameVersion: settings.SUPPORTED_GAME_VERSION,
      sourceHash,
    });

    console.log(
      `Imported game version ${summary.gameVersion}: ${summary.bosses} bosses`,
    );
  } finally {
    await disconnectMongoDB();
  }
}

function requiredArgument(name: string): string {
  const index = process.argv.indexOf(name);
  const value = process.argv[index + 1];

  if (index === -1 || !value || value.startsWith("--")) {
    throw new Error(`Missing required argument ${name}`);
  }

  return path.resolve(value);
}

function readExport(directory: string, filename: string) {
  return readFile(path.join(directory, filename), "utf8");
}

function sha256(filename: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const hash = createHash("sha256");
    const stream = createReadStream(filename);
    stream.on("error", reject);
    stream.on("data", (chunk) => hash.update(chunk));
    stream.on("end", () => resolve(hash.digest("hex")));
  });
}

void importRegulationBossData().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : "Unknown error";
  console.error(`Regulation boss import failed: ${message}`);
  process.exitCode = 1;
});
