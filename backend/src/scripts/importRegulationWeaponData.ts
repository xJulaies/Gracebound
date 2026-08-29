import { createHash } from "node:crypto";
import { createReadStream } from "node:fs";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { settings } from "../config/settings";
import { connectMongoDB, disconnectMongoDB } from "../db";
import { mapRegulationWeaponCatalog } from "../infrastructure/regulation/mappers/mapRegulationWeaponCatalog";
import { addVerifiedWeaponAttacks } from "../infrastructure/regulation/mappers/addVerifiedWeaponAttacks";
import { addVerifiedWeaponSkills } from "../infrastructure/regulation/mappers/addVerifiedWeaponSkills";
import {
  parseAttackElementCorrectCsv,
  parseCalcCorrectGraphCsv,
  parseReinforceWeaponCsv,
  parseWeaponParamCsv,
} from "../infrastructure/regulation/parsers/parseWeaponCsv";
import {
  parseAttackParamCsv,
  parseBehaviorParamCsv,
} from "../infrastructure/regulation/parsers/parseWeaponAttackCsv";
import {
  parseBulletParamCsv,
  parseFinalDamageRateCsv,
  parseSwordArtsParamCsv,
} from "../infrastructure/regulation/parsers/parseWeaponSkillCsv";
import { saveWeaponCatalog } from "../infrastructure/regulation/services/saveWeaponCatalog";
import { saveAshOfWarCatalog } from "../infrastructure/regulation/services/saveAshOfWarCatalog";
import { mapVerifiedAshesOfWar } from "../infrastructure/regulation/mappers/mapVerifiedAshesOfWar";
import { parseEquipParamGemCsv } from "../infrastructure/regulation/parsers/parseWeaponSkillCsv";
import { validateWeaponCatalogVersion } from "../infrastructure/regulation/services/validateWeaponCatalogVersion";

const REQUIRED_EXPORTS = {
  weapons: "EquipParamWeapon.csv",
  reinforcements: "ReinforceParamWeapon.csv",
  corrections: "AttackElementCorrectParam.csv",
  graphs: "CalcCorrectGraph.csv",
  behaviors: "BehaviorParam_PC.csv",
  attacks: "AtkParam_Pc.csv",
  bullets: "Bullet.csv",
  swordArts: "SwordArtsParam.csv",
  finalDamageRates: "FinalDamageRateParam.csv",
  gems: "EquipParamGem.csv",
} as const;

async function importRegulationWeaponData() {
  const exportDirectory = requiredArgument("--exports");
  const regulationFile = requiredArgument("--regulation");
  const [
    weapons,
    reinforcements,
    corrections,
    graphs,
    behaviors,
    attacks,
    bullets,
    swordArts,
    finalDamageRates,
    gems,
    sourceHash,
  ] =
    await Promise.all([
      readExport(exportDirectory, REQUIRED_EXPORTS.weapons),
      readExport(exportDirectory, REQUIRED_EXPORTS.reinforcements),
      readExport(exportDirectory, REQUIRED_EXPORTS.corrections),
      readExport(exportDirectory, REQUIRED_EXPORTS.graphs),
      readExport(exportDirectory, REQUIRED_EXPORTS.behaviors),
      readExport(exportDirectory, REQUIRED_EXPORTS.attacks),
      readExport(exportDirectory, REQUIRED_EXPORTS.bullets),
      readExport(exportDirectory, REQUIRED_EXPORTS.swordArts),
      readExport(exportDirectory, REQUIRED_EXPORTS.finalDamageRates),
      readExport(exportDirectory, REQUIRED_EXPORTS.gems),
      sha256(regulationFile),
    ]);

  const weaponRows = parseWeaponParamCsv(weapons);
  const behaviorRows = parseBehaviorParamCsv(behaviors);
  const attackRows = parseAttackParamCsv(attacks);
  const catalogWithAttacks = addVerifiedWeaponAttacks(
    mapRegulationWeaponCatalog(settings.SUPPORTED_GAME_VERSION, {
    weapons: weaponRows,
    reinforcements: parseReinforceWeaponCsv(reinforcements),
    corrections: parseAttackElementCorrectCsv(corrections),
    graphs: parseCalcCorrectGraphCsv(graphs),
    }),
    weaponRows,
    behaviorRows,
    attackRows,
  );
  const skillTables = {
    behaviors: behaviorRows,
    attacks: attackRows,
    bullets: parseBulletParamCsv(bullets),
    swordArts: parseSwordArtsParamCsv(swordArts),
    finalDamageRates: parseFinalDamageRateCsv(finalDamageRates),
  };
  const catalog = addVerifiedWeaponSkills(catalogWithAttacks, weaponRows, skillTables);
  const ashesOfWar = mapVerifiedAshesOfWar(
    parseEquipParamGemCsv(gems),
    weaponRows,
    skillTables,
  );

  validateWeaponCatalogVersion(settings.SUPPORTED_GAME_VERSION, catalog.report);

  const weaponsWithAttacks = Object.values(catalog.catalog).filter(
    ({ attacks }) => attacks.length > 0,
  );
  const attackProfiles = weaponsWithAttacks.reduce(
    (total, { attacks }) => total + attacks.length,
    0,
  );
  const skillProfiles = Object.values(catalog.catalog).reduce(
    (total, { skills }) => total + skills.length,
    0,
  );
  const skillAttacks = Object.values(catalog.catalog).reduce(
    (total, { skills }) =>
      total + skills.reduce((subtotal, skill) => subtotal + skill.attacks.length, 0),
    0,
  );

  console.log(
    `Validated ${catalog.report.canonicalWeapons} weapons, ${catalog.report.validatedCalculations} calculation variants, ${attackProfiles} direct attack profiles for ${weaponsWithAttacks.length} melee weapons, ${skillAttacks} attacks across ${skillProfiles} fixed skills, and ${ashesOfWar.length} Ashes of War`,
  );

  if (process.argv.includes("--dry-run")) {
    console.log("Dry run complete; MongoDB was not changed");
    return;
  }

  try {
    await connectMongoDB();
    const summary = await saveWeaponCatalog(catalog, {
      gameVersion: settings.SUPPORTED_GAME_VERSION,
      sourceHash,
    });
    const ashSummary = await saveAshOfWarCatalog(ashesOfWar, {
      gameVersion: settings.SUPPORTED_GAME_VERSION,
      sourceHash,
    });

    console.log(
      `Imported game version ${summary.gameVersion}: ${summary.weapons} weapons, ${summary.variants} variants, ${summary.attacks} verified attacks, ${summary.reinforcements} reinforcement datasets, ${summary.scalingCurves} scaling curves`,
    );
    console.log(`Imported ${ashSummary.ashesOfWar} verified Ashes of War`);
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
