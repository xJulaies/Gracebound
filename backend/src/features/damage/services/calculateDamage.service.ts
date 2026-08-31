import { createError } from "../../../shared/errors/createError";
import { settings } from "../../../config/settings";
import { findBossById } from "../../bosses/repositories/boss.repository";
import { calculateAttackRating, calculateCatalystScaling } from "../../weapons/domain/calculateAttackRating";
import {
  findWeaponAttackProfile,
  findWeaponCatalogById,
  findWeaponCalculationData,
  findWeaponSkillAttack,
} from "../../weapons/repositories/weapon.repository";
import type { WeaponSkillAttack } from "../../weapons/domain/weaponSkill.types";
import { findCompatibleAshOfWarAttack } from "../../ashesOfWar/repositories/ashOfWar.repository";
import { findTalismansByIds } from "../../talismans/repositories/talisman.repository";
import { applyAttributeBonuses } from "../../builds/domain/calculateBuildStats";
import { findArmorByIds } from "../../armor/repositories/armor.repository";
import { calculateArmorStats } from "../../builds/domain/calculateArmorStats";
import { calculateAttackOutput } from "../domain/calculateAttackOutput";
import { calculateHitDamage } from "../domain/calculateDamage";
import type {
  CalculateDamageInput,
  WeaponDamageInput,
  SpellDamageInput,
} from "../schemas/damage.schema";
import { findSpellById } from "../../spells/repositories/spell.repository";

export async function calculateDamageFromInput(input: CalculateDamageInput) {
  const target = input.bossId
    ? await findDamageTarget(input.bossId)
    : undefined;

  if ("attackRating" in input) {
    return calculateHitDamage({
      attackRating: input.attackRating,
      motionValue: input.motionValue,
      physicalAttackType: input.physicalAttackType,
      target,
    });
  }

  if ("spellId" in input) return calculateSpellDamage(input, target);

  return calculateWeaponDamage(input, target);
}

async function calculateSpellDamage(
  input: SpellDamageInput,
  target?: Awaited<ReturnType<typeof findDamageTarget>>,
) {
  const [spell, catalystCatalog, catalystData] = await Promise.all([
    findSpellById(input.spellId, settings.SUPPORTED_GAME_VERSION),
    findWeaponCatalogById(input.catalystWeaponId, settings.SUPPORTED_GAME_VERSION),
    findWeaponCalculationData(input.catalystVariantId, settings.SUPPORTED_GAME_VERSION),
  ]);
  if (!spell?.attack || spell.calculationStatus !== "supported") {
    throw createError(400, "Unsupported spell damage calculation");
  }
  if (!catalystCatalog || !catalystData) throw createError(400, "Unknown catalyst selection");
  if (!catalystCatalog.variants.some(({ id }) => id === input.catalystVariantId)) {
    throw createError(400, "Catalyst variant does not belong to selected weapon");
  }
  if (!catalystCatalog.castingTypes.includes(spell.type)) {
    throw createError(400, "Catalyst cannot cast selected spell");
  }
  const { weapon, dataSet } = catalystData;
  if (input.upgradeLevel > weapon.maxUpgradeLevel) throw createError(400, "Invalid catalyst upgrade level");
  if (Object.entries(weapon.requirements).some(([attribute, requirement]) =>
    input.stats[attribute as keyof typeof input.stats] < requirement)) {
    throw createError(400, `Attribute requirements not met for ${weapon.name}`);
  }
  const damageTypes = ["physical", "magic", "fire", "lightning", "holy"] as const;
  const catalystScaling = Object.fromEntries(damageTypes.map((damageType) => [
    damageType,
    spell.attack!.motionValues[damageType] === 0
      ? 0
      : calculateCatalystScaling(weapon, input.upgradeLevel, input.stats, damageType, dataSet),
  ])) as Record<(typeof damageTypes)[number], number>;
  const calculation = calculateAttackOutput(catalystScaling, {
    id: spell.id,
    name: spell.name,
    fpCost: spell.fpCost,
    components: [{
      kind: "projectile",
      sourceBehaviorId: 0,
      sourceBulletId: spell.attack.sourceBulletId,
      sourceAttackId: spell.attack.sourceAttackId,
      physicalAttackType: "standard",
      motionValues: spell.attack.motionValues,
      addedDamage: emptyDamageTypes(),
      finalDamageRates: spell.attack.finalDamageRates,
    }],
  }, target);
  return {
    spell: { id: spell.id, name: spell.name, type: spell.type },
    catalyst: {
      weaponId: catalystCatalog.id, variantId: weapon.id,
      name: catalystCatalog.name, upgradeLevel: input.upgradeLevel,
    },
    stats: input.stats,
    ...calculation,
    limitations: ["Only verified single-hit direct projectile profiles are supported."],
  };
}

async function calculateWeaponDamage(
  input: WeaponDamageInput,
  target?: Awaited<ReturnType<typeof findDamageTarget>>,
) {
  const [calculationData, attack, talismans, armor] = await Promise.all([
    findWeaponCalculationData(
      input.weaponId,
      settings.SUPPORTED_GAME_VERSION,
    ),
    findSelectedAttack(input),
    findTalismansByIds(input.talismanIds, settings.SUPPORTED_GAME_VERSION),
    findArmorByIds(input.armorIds, settings.SUPPORTED_GAME_VERSION),
  ]);

  if (!calculationData) {
    throw createError(404, "Weapon not found");
  }

  if (!attack) {
    throw createError(404, "Weapon attack not found");
  }

  if (talismans.length !== input.talismanIds.length || talismans.some(({ effects }) => !effects)) {
    throw createError(400, "Unsupported talisman selection");
  }
  if (armor.length !== input.armorIds.length) throw createError(400, "Unknown armor selection");
  let armorStats: ReturnType<typeof calculateArmorStats>;
  try {
    const byId = new Map(armor.map((item) => [item.id, item]));
    armorStats = calculateArmorStats(input.armorIds.map((id) => byId.get(id)!));
  } catch (error) {
    throw createError(400, error instanceof Error ? error.message : "Invalid armor selection");
  }

  const { weapon, dataSet } = calculationData;

  if (input.upgradeLevel > weapon.maxUpgradeLevel) {
    throw createError(400, "Invalid weapon upgrade level");
  }

  const effectiveStats = applyAttributeBonuses(
    applyAttributeBonuses(input.stats, talismans.map(({ effects }) => effects!)),
    [armorStats.passiveEffects],
  );
  const attackRating = calculateAttackRating(
    weapon,
    input.upgradeLevel,
    effectiveStats,
    dataSet,
  );
  const outgoingDamageMultipliers = talismans.reduce(
    (multipliers, { effects }) => ({
      physical: multipliers.physical * effects!.outgoingDamageMultipliers.physical,
      magic: multipliers.magic * effects!.outgoingDamageMultipliers.magic,
      fire: multipliers.fire * effects!.outgoingDamageMultipliers.fire,
      lightning: multipliers.lightning * effects!.outgoingDamageMultipliers.lightning,
      holy: multipliers.holy * effects!.outgoingDamageMultipliers.holy,
    }),
    unitDamageTypes(),
  );
  const talismanDamageMultipliers = "skillAttackId" in input
    ? talismans.reduce(
      (multipliers, { effects }) => ({
        physical: multipliers.physical * effects!.skillDamageMultipliers.physical,
        magic: multipliers.magic * effects!.skillDamageMultipliers.magic,
        fire: multipliers.fire * effects!.skillDamageMultipliers.fire,
        lightning: multipliers.lightning * effects!.skillDamageMultipliers.lightning,
        holy: multipliers.holy * effects!.skillDamageMultipliers.holy,
      }),
      outgoingDamageMultipliers,
    )
    : input.attackId.includes("charged-heavy")
      ? talismans.reduce(
        (multipliers, { effects }) => ({
          physical: multipliers.physical * effects!.chargedAttackDamageMultipliers.physical,
          magic: multipliers.magic * effects!.chargedAttackDamageMultipliers.magic,
          fire: multipliers.fire * effects!.chargedAttackDamageMultipliers.fire,
          lightning: multipliers.lightning * effects!.chargedAttackDamageMultipliers.lightning,
          holy: multipliers.holy * effects!.chargedAttackDamageMultipliers.holy,
        }),
        outgoingDamageMultipliers,
      )
      : outgoingDamageMultipliers;
  const appliedDamageMultipliers = applySupportedArmorDamageMultipliers(
    talismanDamageMultipliers,
    armorStats.passiveEffects.scopedDamageBoosts,
    "attackId" in input && input.attackId.includes("jumping"),
  );
  const calculation = calculateAttackOutput(
    attackRating,
    attack,
    target,
    appliedDamageMultipliers,
  );

  return {
    weapon: {
      id: weapon.id,
      name: weapon.name,
      gameVersion: weapon.gameVersion,
      upgradeLevel: input.upgradeLevel,
    },
    stats: input.stats,
    effectiveStats,
    talismans: talismans.map(({ id, name }) => ({ id, name })),
    armor: armor.map(({ id, name, slot }) => ({ id, name, slot })),
    ...calculation,
    limitations: [
      "Buffs, status effects, and special mechanics are not included.",
    ],
  };
}

function applySupportedArmorDamageMultipliers(
  multipliers: ReturnType<typeof unitDamageTypes>,
  effects: ReturnType<typeof calculateArmorStats>["passiveEffects"]["scopedDamageBoosts"],
  isJumpingAttack: boolean,
) {
  return effects.reduce((total, effect) => {
    if (effect.scope !== "all-physical-attacks" && !(effect.scope === "jumping-attacks" && isJumpingAttack)) return total;
    return {
      physical: total.physical * effect.damageMultipliers.physical,
      magic: total.magic * effect.damageMultipliers.magic,
      fire: total.fire * effect.damageMultipliers.fire,
      lightning: total.lightning * effect.damageMultipliers.lightning,
      holy: total.holy * effect.damageMultipliers.holy,
    };
  }, multipliers);
}

async function findSelectedAttack(
  input: WeaponDamageInput,
): Promise<WeaponSkillAttack | null> {
  if ("ashOfWarId" in input) {
    const weapon = await findWeaponCatalogById(
      input.weaponId,
      settings.SUPPORTED_GAME_VERSION,
    );

    if (!weapon?.weaponType) return null;

    return findCompatibleAshOfWarAttack(
      input.ashOfWarId,
      input.skillAttackId,
      weapon.weaponType,
      settings.SUPPORTED_GAME_VERSION,
    );
  }

  if ("skillAttackId" in input) {
    return findWeaponSkillAttack(
      input.weaponId,
      input.skillAttackId,
      settings.SUPPORTED_GAME_VERSION,
    );
  }

  const attack = await findWeaponAttackProfile(
    input.weaponId,
    input.attackId,
    settings.SUPPORTED_GAME_VERSION,
  );

  if (!attack) return null;

  return {
    id: attack.id,
    name: attack.name,
    fpCost: 0,
    components: [
      {
        kind: "weapon-hit",
        sourceBehaviorId: attack.sourceBehaviorId,
        sourceAttackId: attack.sourceAttackId,
        physicalAttackType: attack.physicalAttackType,
        motionValues: attack.motionValues,
        addedDamage: emptyDamageTypes(),
        finalDamageRates: unitDamageTypes(),
      },
    ],
  };
}

function emptyDamageTypes() {
  return { physical: 0, magic: 0, fire: 0, lightning: 0, holy: 0 };
}

function unitDamageTypes() {
  return { physical: 1, magic: 1, fire: 1, lightning: 1, holy: 1 };
}

async function findDamageTarget(bossId: string) {
  const boss = await findBossById(bossId, settings.SUPPORTED_GAME_VERSION);

  if (!boss) {
    throw createError(404, "Boss not found");
  }

  return {
    id: boss.id,
    name: boss.name,
    defense: boss.defense,
    absorption: boss.absorption,
  };
}
