import { createHash } from "node:crypto";
import { createReadStream } from "node:fs";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { settings } from "../config/settings";
import { connectMongoDB, disconnectMongoDB } from "../db";
import { mapBaseGameSpells } from "../infrastructure/regulation/mappers/mapRegulationSpells";
import { parseMagicParamCsv } from "../infrastructure/regulation/parsers/parseMagicParamCsv";
import { parseAttackParamCsv } from "../infrastructure/regulation/parsers/parseWeaponAttackCsv";
import { parseBulletParamCsv, parseFinalDamageRateCsv } from "../infrastructure/regulation/parsers/parseWeaponSkillCsv";
import { saveSpellCatalog } from "../infrastructure/regulation/services/saveSpellCatalog";

async function importRegulationSpellData() {
  const exportDirectory = requiredArgument("--exports");
  const regulationFile = requiredArgument("--regulation");
  const [csv, bulletsCsv, attacksCsv, finalRatesCsv, sourceHash] = await Promise.all([
    readFile(path.join(exportDirectory, "Magic.csv"), "utf8"),
    readFile(path.join(exportDirectory, "Bullet.csv"), "utf8"),
    readFile(path.join(exportDirectory, "AtkParam_Pc.csv"), "utf8"),
    readFile(path.join(exportDirectory, "FinalDamageRateParam.csv"), "utf8"),
    sha256(regulationFile),
  ]);
  const spells = mapBaseGameSpells(parseMagicParamCsv(csv), {
    bullets: parseBulletParamCsv(bulletsCsv),
    attacks: parseAttackParamCsv(attacksCsv),
    finalDamageRates: parseFinalDamageRateCsv(finalRatesCsv),
  });
  if (settings.SUPPORTED_GAME_VERSION === "1.17.0") validateCatalog(spells);
  console.log(`Validated ${spells.length} base-game spells`);
  if (process.argv.includes("--dry-run")) {
    console.log("Dry run complete; MongoDB was not changed");
    return;
  }
  try {
    await connectMongoDB();
    const summary = await saveSpellCatalog(spells, { gameVersion: settings.SUPPORTED_GAME_VERSION, sourceHash });
    console.log(`Imported game version ${summary.gameVersion}: ${summary.spells} spells`);
  } finally {
    await disconnectMongoDB();
  }
}

function validateCatalog(spells: ReturnType<typeof mapBaseGameSpells>) {
  const sorceries = spells.filter(({ type }) => type === "sorcery");
  const incantations = spells.filter(({ type }) => type === "incantation");
  if (sorceries.length !== 70 || incantations.length !== 101) {
    throw new Error(`Incomplete 1.17.0 spell catalog: expected 70/101, mapped ${sorceries.length}/${incantations.length}`);
  }
  for (const id of ["glintstone-pebble", "death-lightning", "night-maiden-s-mist", "lightning-spear"]) {
    if (!spells.some((spell) => spell.id === id)) throw new Error(`Missing reference spell ${id}`);
  }
  const supported = spells.filter(({ calculationStatus }) => calculationStatus === "supported");
  const expectedSupported = ["glintstone-pebble", "great-glintstone-shard", "swift-glintstone-shard"];
  if (supported.length !== expectedSupported.length ||
      expectedSupported.some((id) => !supported.some((spell) => spell.id === id))) {
    throw new Error("Incomplete verified direct-projectile spell profiles");
  }
}

function requiredArgument(name: string) {
  const index = process.argv.indexOf(name);
  const value = process.argv[index + 1];
  if (index === -1 || !value || value.startsWith("--")) throw new Error(`Missing required argument ${name}`);
  return path.resolve(value);
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

void importRegulationSpellData().catch((error: unknown) => {
  console.error(`Regulation spell import failed: ${error instanceof Error ? error.message : "Unknown error"}`);
  process.exitCode = 1;
});
