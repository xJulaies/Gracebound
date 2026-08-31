import { createHash } from "node:crypto";
import { createReadStream } from "node:fs";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { settings } from "../config/settings";
import { connectMongoDB, disconnectMongoDB } from "../db";
import { mapBaseGameArmor } from "../infrastructure/regulation/mappers/mapRegulationArmor";
import { parseArmorBehaviorCsv, parseArmorBulletCsv, parseArmorEffectCsv, parseArmorParamCsv } from "../infrastructure/regulation/parsers/parseArmorParamCsv";
import { saveArmorCatalog } from "../infrastructure/regulation/services/saveArmorCatalog";

async function importRegulationArmorData() {
  const exportDirectory = requiredArgument("--exports");
  const regulationFile = requiredArgument("--regulation");
  const [csv, effectCsv, behaviorCsv, bulletCsv, sourceHash] = await Promise.all([
    readFile(path.join(exportDirectory, "EquipParamProtector.csv"), "utf8"),
    readFile(path.join(exportDirectory, "SpEffectParam.csv"), "utf8"),
    readFile(path.join(exportDirectory, "BehaviorParam_PC.csv"), "utf8"),
    readFile(path.join(exportDirectory, "Bullet.csv"), "utf8"),
    sha256(regulationFile),
  ]);
  const armor = mapBaseGameArmor(parseArmorParamCsv(csv), parseArmorEffectCsv(effectCsv), {
    behaviors: parseArmorBehaviorCsv(behaviorCsv),
    bullets: parseArmorBulletCsv(bulletCsv),
  });
  if (settings.SUPPORTED_GAME_VERSION === "1.17.0" && armor.length !== 587) {
    throw new Error(`Incomplete 1.17.0 armor catalog: expected 587, mapped ${armor.length}`);
  }
  if (settings.SUPPORTED_GAME_VERSION === "1.17.0") validateKnownArmorEffects(armor);
  const unresolvedArmor = armor.filter(({ hasUnresolvedPassiveEffects }) => hasUnresolvedPassiveEffects);
  console.log(`Validated ${armor.length} base-game armor pieces (${unresolvedArmor.length} with unresolved effects)`);
  if (process.argv.includes("--dry-run")) {
    console.log("Dry run complete; MongoDB was not changed");
    return;
  }
  try {
    await connectMongoDB();
    const summary = await saveArmorCatalog(armor, { gameVersion: settings.SUPPORTED_GAME_VERSION, sourceHash });
    console.log(`Imported game version ${summary.gameVersion}: ${summary.armor} armor pieces`);
  } finally {
    await disconnectMongoDB();
  }
}

function validateKnownArmorEffects(armor: ReturnType<typeof mapBaseGameArmor>) {
  const byId = new Map(armor.map((item) => [item.id, item]));
  const effectIds = new Set(armor.flatMap(({ sourceEffectIds }) => sourceEffectIds));
  const unresolvedIds = armor.filter(({ hasUnresolvedPassiveEffects }) => hasUnresolvedPassiveEffects).map(({ id }) => id);
  if (effectIds.size !== 98) throw new Error(`Unexpected armor effect inventory: expected 98, found ${effectIds.size}`);
  if (armor.filter(({ sourceEffectIds }) => sourceEffectIds.length > 0).length !== 90) {
    throw new Error("Unexpected number of armor pieces with resident effects");
  }
  if (unresolvedIds.length !== 1 || unresolvedIds[0] !== "pumpkin-helm") {
    throw new Error(`Unexpected unresolved armor effects: ${unresolvedIds.join(", ")}`);
  }
  const royalRemains = byId.get("royal-remains-helm")?.passiveEffects.regenerationEffects[0];
  const deathbedDress = byId.get("deathbed-dress")?.passiveEffects.regenerationEffects[0];
  if (royalRemains?.target !== "wearer" || royalRemains.hpPerSecond !== 2 || royalRemains.maximumHpPercent !== 18) {
    throw new Error("Invalid Royal Remains regeneration mapping");
  }
  if (deathbedDress?.target !== "nearby-allies" || deathbedDress.hpPerSecond !== 2 || deathbedDress.radius !== 7) {
    throw new Error("Invalid Deathbed Dress regeneration mapping");
  }
  if (byId.get("black-knife-armor")?.passiveEffects.utilityEffects.enemyHearingMultiplier !== 0) {
    throw new Error("Invalid Black Knife Armor stealth mapping");
  }
  if (byId.get("briar-helm")?.passiveEffects.utilityEffects.dodgeContactPhysicalDamage !== 18) {
    throw new Error("Invalid Briar dodge-contact damage mapping");
  }
  if (byId.get("duelist-helm")?.passiveEffects.utilityEffects.aggroPriorityModifier !== 0.03) {
    throw new Error("Invalid Duelist aggro mapping");
  }
  if (!byId.get("pumpkin-helm")?.passiveEffects.utilityEffects.reducesHeadshotImpact) {
    throw new Error("Invalid Pumpkin Helm headshot-impact marker");
  }
  const spellblade = byId.get("spellblade-s-pointed-hat")?.passiveEffects.scopedDamageBoosts[0];
  if (spellblade?.scope !== "glintstone-weapon-skills" || spellblade.damageMultipliers.magic !== 1.02) {
    throw new Error("Invalid Spellblade damage mapping");
  }
  const raptor = byId.get("raptor-s-black-feathers")?.passiveEffects.scopedDamageBoosts[0];
  if (raptor?.scope !== "jumping-attacks" || raptor.damageMultipliers.physical !== 1.1) {
    throw new Error("Invalid Raptor damage mapping");
  }
  const silverTear = byId.get("silver-tear-mask")?.passiveEffects.scopedDamageBoosts[0];
  if (silverTear?.scope !== "all-physical-attacks" || silverTear.damageMultipliers.physical !== 0.95) {
    throw new Error("Invalid Silver Tear Mask damage mapping");
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

void importRegulationArmorData().catch((error: unknown) => {
  console.error(`Regulation armor import failed: ${error instanceof Error ? error.message : "Unknown error"}`);
  process.exitCode = 1;
});
