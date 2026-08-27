import { createHash } from "node:crypto";
import { createReadStream } from "node:fs";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { settings } from "../config/settings";
import { connectMongoDB, disconnectMongoDB } from "../db";
import { mapRegulationWeaponCatalog } from "../infrastructure/regulation/mappers/mapRegulationWeaponCatalog";
import {
  parseAttackElementCorrectCsv,
  parseCalcCorrectGraphCsv,
  parseReinforceWeaponCsv,
  parseWeaponParamCsv,
} from "../infrastructure/regulation/parsers/parseWeaponCsv";
import { saveWeaponCatalog } from "../infrastructure/regulation/services/saveWeaponCatalog";

const REQUIRED_EXPORTS = {
  weapons: "EquipParamWeapon.csv",
  reinforcements: "ReinforceParamWeapon.csv",
  corrections: "AttackElementCorrectParam.csv",
  graphs: "CalcCorrectGraph.csv",
} as const;

async function importRegulationWeaponData() {
  const exportDirectory = requiredArgument("--exports");
  const regulationFile = requiredArgument("--regulation");
  const [weapons, reinforcements, corrections, graphs, sourceHash] =
    await Promise.all([
      readExport(exportDirectory, REQUIRED_EXPORTS.weapons),
      readExport(exportDirectory, REQUIRED_EXPORTS.reinforcements),
      readExport(exportDirectory, REQUIRED_EXPORTS.corrections),
      readExport(exportDirectory, REQUIRED_EXPORTS.graphs),
      sha256(regulationFile),
    ]);

  const catalog = mapRegulationWeaponCatalog(settings.SUPPORTED_GAME_VERSION, {
    weapons: parseWeaponParamCsv(weapons),
    reinforcements: parseReinforceWeaponCsv(reinforcements),
    corrections: parseAttackElementCorrectCsv(corrections),
    graphs: parseCalcCorrectGraphCsv(graphs),
  });

  console.log(
    `Validated ${catalog.report.canonicalWeapons} weapons and ${catalog.report.validatedCalculations} calculation variants`,
  );

  try {
    await connectMongoDB();
    const summary = await saveWeaponCatalog(catalog, {
      gameVersion: settings.SUPPORTED_GAME_VERSION,
      sourceHash,
    });

    console.log(
      `Imported game version ${summary.gameVersion}: ${summary.weapons} weapons, ${summary.variants} variants, ${summary.reinforcements} reinforcement datasets, ${summary.scalingCurves} scaling curves`,
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

async function readExport(directory: string, filename: string) {
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

void importRegulationWeaponData().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : "Unknown error";
  console.error(`Regulation weapon import failed: ${message}`);
  process.exitCode = 1;
});
