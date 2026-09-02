import type { AshOfWarData } from "../../../features/ashesOfWar/domain/ashOfWar.types";
import { WEAPON_AFFINITIES } from "../../../features/weapons/domain/weaponCatalog.types";
import { ASH_OF_WAR_COMPATIBILITY_FIELDS } from "../data/ashOfWarCompatibility";
import { flameOfTheRedmanesSkillDefinition } from "../data/flameOfTheRedmanesSkillDefinition";
import { squareOffSkillDefinition } from "../data/squareOffSkillDefinition";
import { standardAshOfWarSkillDefinitions } from "../data/standardAshOfWarSkillDefinitions";
import { wildStrikesSkillDefinitions } from "../data/wildStrikesSkillDefinitions";
import { prayerfulStrikeSkillDefinitions } from "../data/prayerfulStrikeSkillDefinitions";
import type { WeaponParamRow } from "../schemas/weaponParam.schema";
import type { EquipParamGemRow } from "../schemas/weaponSkillParam.schema";
import type { ArmorEffectRow } from "../schemas/armor.schema";
import {
  mapRegulationWeaponSkill,
  type RegulationWeaponSkillDefinition,
} from "./mapRegulationWeaponSkill";

const LONGSWORD_SOURCE_ID = 1000000;
const VERIFIED_SKILL_BUFF_EFFECT_IDS = new Map([
  [20100, 821], [21400, 1776], [21700, 1676], [60000, 1691],
  [60100, 1701], [60600, 1755], [60700, 1821],
]);

const verifiedAshes = new Map<number, RegulationWeaponSkillDefinition>([
  { sourceGemId: 11500, definition: squareOffSkillDefinition },
  { sourceGemId: 50500, definition: flameOfTheRedmanesSkillDefinition },
  ...standardAshOfWarSkillDefinitions,
].map(({ sourceGemId, definition }) => [sourceGemId, definition]));

type SkillTables = Parameters<typeof mapRegulationWeaponSkill>[2];

export function mapVerifiedAshesOfWar(
  gems: EquipParamGemRow[],
  weapons: WeaponParamRow[],
  tables: SkillTables,
  effects: ArmorEffectRow[] = [],
): AshOfWarData[] {
  const referenceWeapon = findOne(weapons, LONGSWORD_SOURCE_ID, "weapon");

  return gems
    .filter(({ ID, Name }) => ID >= 10000 && /^Ash of War:\s*.+/.test(Name))
    .map((gem) => {
    const definition = verifiedAshes.get(gem.ID);
    const buffEffect = mapSkillBuffEffect(gem.ID, effects);
    const variantDefinitions = gem.ID === 11000
      ? wildStrikesSkillDefinitions
      : gem.ID === 20800
        ? prayerfulStrikeSkillDefinitions
        : [];
    const skillVariants = variantDefinitions.map(
      ({ weaponType, motionCategoryId, definition: variantDefinition }) => ({
        weaponTypes: [weaponType],
        skill: mapRegulationWeaponSkill(
          findReferenceWeapon(weapons, motionCategoryId),
          variantDefinition,
          tables,
        ),
      }),
    );

    if (definition && gem.swordArtsParamId !== definition.swordArtId) {
      throw new Error(`Ash of War ${gem.ID} has unexpected SwordArtsParam ${gem.swordArtsParamId}`);
    }

    const variantSwordArtId = variantDefinitions[0]?.definition.swordArtId;
    if (variantSwordArtId !== undefined && gem.swordArtsParamId !== variantSwordArtId) {
      throw new Error(`Ash of War ${gem.ID} has unexpected SwordArtsParam ${gem.swordArtsParamId}`);
    }

    return {
      id: definition?.id ?? slugify(gem.Name.replace(/^Ash of War:\s*/, "")),
      sourceGemId: gem.ID,
      name: gem.Name.replace(/^Ash of War:\s*/, ""),
      iconId: gem.iconId,
      sourceSwordArtId: gem.swordArtsParamId,
      compatibleWeaponTypes: compatibleWeaponTypes(gem),
      compatibleAffinities: WEAPON_AFFINITIES.filter(
        (_affinity, index) => gem[`configurableWepAttr${index.toString().padStart(2, "0")}`] === 1,
      ),
      calculationStatus: definition || skillVariants.length > 0 || buffEffect
        ? "supported" as const
        : "catalog-only" as const,
      buffEffect,
      skill: definition
        ? mapRegulationWeaponSkill(referenceWeapon, definition, tables)
        : null,
      skillVariants,
    };
  });
}

function mapSkillBuffEffect(gemId: number, effects: ArmorEffectRow[]) {
  const effectId = VERIFIED_SKILL_BUFF_EFFECT_IDS.get(gemId);
  if (!effectId) return null;
  const effect = effects.find(({ ID }) => ID === effectId);
  if (!effect) throw new Error(`Missing skill buff effect ${effectId} for Ash of War ${gemId}`);
  const hitEffect = effect.atkOccurrenceSpEffectId >= 0
    ? effects.find(({ ID }) => ID === effect.atkOccurrenceSpEffectId)
    : null;
  if (effect.atkOccurrenceSpEffectId >= 0 && !hitEffect) {
    throw new Error(`Missing skill buff hit effect ${effect.atkOccurrenceSpEffectId}`);
  }
  return {
    durationSeconds: effect.effectEndurance,
    consumption: gemId === 60000 || gemId === 60100 ? "next-hit" as const : "duration" as const,
    attackPowerMultipliers: damageTypes(effect, "AttackPowerRate"),
    outgoingDamageMultipliers: {
      physical: effect.atkEnemyDmgCorrectRate_Physics,
      magic: effect.atkEnemyDmgCorrectRate_Magic,
      fire: effect.atkEnemyDmgCorrectRate_Fire,
      lightning: effect.atkEnemyDmgCorrectRate_Thunder,
      holy: effect.atkEnemyDmgCorrectRate_Dark,
    },
    addedDamage: damageTypes(effect, "AttackPower"),
    addedStatusBuildup: {
      poison: hitEffect?.poizonAttackPower ?? 0, rot: hitEffect?.diseaseAttackPower ?? 0,
      bleed: hitEffect?.bloodAttackPower ?? 0, frost: hitEffect?.freezeAttackPower ?? 0,
      sleep: hitEffect?.sleepAttackPower ?? 0, madness: hitEffect?.madnessAttackPower ?? 0,
      deathBlight: hitEffect?.curseAttackPower ?? 0,
    },
    poiseDamageMultiplier: effect.saAttackPowerRate ?? 1,
    limitations: gemId === 60600
      ? ["Seppuku self-damage is not included."]
      : gemId === 20100
        ? ["Sacred Blade anti-undead behavior is not included."]
        : [],
  };
}

function damageTypes(effect: ArmorEffectRow, suffix: "AttackPower" | "AttackPowerRate") {
  return {
    physical: effect[`physics${suffix}`] ?? 1, magic: effect[`magic${suffix}`] ?? 1,
    fire: effect[`fire${suffix}`] ?? 1, lightning: effect[`thunder${suffix}`] ?? 1,
    holy: effect[`dark${suffix}`] ?? 1,
  };
}

function findReferenceWeapon(rows: WeaponParamRow[], motionCategoryId: number): WeaponParamRow {
  const match = rows.find(({ ID, Name, originEquipWep, wepmotionCategory }) =>
    ID === originEquipWep && Name !== "" && wepmotionCategory === motionCategoryId,
  );
  if (!match) throw new Error(`Missing reference weapon for motion category ${motionCategoryId}`);
  return match;
}

function compatibleWeaponTypes(gem: EquipParamGemRow): string[] {
  return Object.entries(ASH_OF_WAR_COMPATIBILITY_FIELDS)
    .filter(([field]) => gem[field] === 1)
    .map(([, weaponType]) => weaponType);
}

function findOne<T extends { ID: number }>(rows: T[], id: number, name: string): T {
  const matches = rows.filter(({ ID }) => ID === id);
  if (matches.length !== 1) throw new Error(`Expected one ${name} ${id}, found ${matches.length}`);
  return matches[0]!;
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}
