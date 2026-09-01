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
import { findSpellById, findSpellsByIds } from "../../spells/repositories/spell.repository";

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
  const [spell, catalystCatalog, catalystData, talismans, buffs] = await Promise.all([
    findSpellById(input.spellId, settings.SUPPORTED_GAME_VERSION),
    findWeaponCatalogById(input.catalystWeaponId, settings.SUPPORTED_GAME_VERSION),
    findWeaponCalculationData(input.catalystVariantId, settings.SUPPORTED_GAME_VERSION),
    findTalismansByIds(input.talismanIds, settings.SUPPORTED_GAME_VERSION),
    findSpellsByIds(input.buffSpellIds, settings.SUPPORTED_GAME_VERSION),
  ]);
  if (!spell?.attack || spell.calculationStatus !== "supported") {
    throw createError(400, "Unsupported spell damage calculation");
  }
  const selectedAttack = input.charged ? spell.chargedAttack : spell.attack;
  if (!selectedAttack) throw createError(400, "Selected spell has no charged damage profile");
  const spellComponents = [selectedAttack, ...selectedAttack.additionalComponents];
  if (!catalystCatalog || !catalystData) throw createError(400, "Unknown catalyst selection");
  if (talismans.length !== input.talismanIds.length || talismans.some(({ effects }) => !effects)) {
    throw createError(400, "Unsupported talisman selection");
  }
  const talismansById = new Map(talismans.map((talisman) => [talisman.id, talisman]));
  const selectedTalismans = input.talismanIds.map((id) => talismansById.get(id)!);
  const selectedBuffs = validateGeneralBuffs(input.buffSpellIds, buffs);
  if (!catalystCatalog.variants.some(({ id }) => id === input.catalystVariantId)) {
    throw createError(400, "Catalyst variant does not belong to selected weapon");
  }
  if (!catalystCatalog.castingTypes.includes(spell.type)) {
    throw createError(400, "Catalyst cannot cast selected spell");
  }
  const { weapon, dataSet } = catalystData;
  if (input.upgradeLevel > weapon.maxUpgradeLevel) throw createError(400, "Invalid catalyst upgrade level");
  const effectiveStats = applyAttributeBonuses(input.stats, selectedTalismans.map(({ effects }) => effects!));
  if (Object.entries(weapon.requirements).some(([attribute, requirement]) =>
    effectiveStats[attribute as keyof typeof effectiveStats] < requirement)) {
    throw createError(400, `Attribute requirements not met for ${weapon.name}`);
  }
  if (effectiveStats.intelligence < spell.requirements.intelligence ||
      effectiveStats.faith < spell.requirements.faith ||
      effectiveStats.arcane < spell.requirements.arcane) {
    throw createError(400, `Attribute requirements not met for ${spell.name}`);
  }
  const damageTypes = ["physical", "magic", "fire", "lightning", "holy"] as const;
  const catalystScaling = Object.fromEntries(damageTypes.map((damageType) => [
    damageType,
    spellComponents.every((component) => component.motionValues[damageType] === 0)
      ? 0
      : calculateCatalystScaling(weapon, input.upgradeLevel, effectiveStats, damageType, dataSet),
  ])) as Record<(typeof damageTypes)[number], number>;
  const talismanMultipliers = selectedTalismans.reduce((total, { effects }) => {
    const spellTypeMultiplier = effects!.spellDamageMultipliers[spell.type];
    return Object.fromEntries(damageTypes.map((damageType) => [
      damageType,
      total[damageType] *
        effects!.outgoingDamageMultipliers[damageType] *
        spellTypeMultiplier *
        (input.charged
          ? effects!.specializedAttackEffects.chargedSpellAndSkillDamageMultipliers[damageType]
          : 1),
    ])) as typeof total;
  }, unitDamageTypes());
  const damageMultipliers = applyBuffMultipliers(talismanMultipliers, selectedBuffs);
  const calculation = calculateAttackOutput(catalystScaling, {
    id: input.charged ? `${spell.id}-charged` : spell.id,
    name: input.charged ? `${spell.name} (Charged)` : spell.name,
    fpCost: input.charged ? spell.chargedFpCost! : spell.fpCost,
    components: spellComponents.map((component) => ({
      kind: "projectile",
      sourceBehaviorId: 0,
      sourceBulletId: component.sourceBulletId,
      sourceAttackId: component.sourceAttackId,
      physicalAttackType: "standard",
      motionValues: component.motionValues,
      addedDamage: emptyDamageTypes(),
      finalDamageRates: component.finalDamageRates,
    })),
  }, target, damageMultipliers);
  const calculatedComponents = calculation.components.map((component, index) => ({
    ...component,
    id: spellComponents[index]!.id,
    label: spellComponents[index]!.label,
    outputUnit: spellComponents[index]!.outputUnit,
    statusBuildup: spellComponents[index]!.statusBuildup,
  }));
  const hasMultipleComponents = spellComponents.length > 1;
  return {
    spell: { id: spell.id, name: spell.name, type: spell.type, charged: input.charged },
    catalyst: {
      weaponId: catalystCatalog.id, variantId: weapon.id,
      name: catalystCatalog.name, upgradeLevel: input.upgradeLevel,
    },
    stats: input.stats,
    effectiveStats,
    talismans: selectedTalismans.map(({ id, name }) => ({ id, name })),
    buffs: selectedBuffs.map(({ id, name, buffEffect }) => ({
      id, name, slot: buffEffect!.slot, durationSeconds: buffEffect!.durationSeconds,
    })),
    ...calculation,
    components: calculatedComponents,
    outputUnit: hasMultipleComponents ? "per-component" as const : selectedAttack.outputUnit,
    statusBuildup: hasMultipleComponents ? null : selectedAttack.statusBuildup,
    aggregateAssumption: hasMultipleComponents ? "one-occurrence-per-component" as const : null,
    limitations: hasMultipleComponents
      ? ["Combined output contains one occurrence of each component; repeated area ticks and total duration are not inferred."]
      : selectedAttack.outputUnit === "per-tick"
        ? ["Output is calculated per verified damage tick; duration and total hit count are not inferred."]
        : ["Output is calculated per verified hit; total connecting hit count is not inferred."],
  };
}

async function calculateWeaponDamage(
  input: WeaponDamageInput,
  target?: Awaited<ReturnType<typeof findDamageTarget>>,
) {
  const [calculationData, attack, talismans, armor, buffs] = await Promise.all([
    findWeaponCalculationData(
      input.weaponId,
      settings.SUPPORTED_GAME_VERSION,
    ),
    findSelectedAttack(input),
    findTalismansByIds(input.talismanIds, settings.SUPPORTED_GAME_VERSION),
    findArmorByIds(input.armorIds, settings.SUPPORTED_GAME_VERSION),
    findSpellsByIds(input.buffSpellIds, settings.SUPPORTED_GAME_VERSION),
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
  const selectedBuffs = validateGeneralBuffs(input.buffSpellIds, buffs);
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
  const baseAttackRating = calculateAttackRating(
    weapon,
    input.upgradeLevel,
    effectiveStats,
    dataSet,
  );
  const appliedWeaponBuff = await resolveWeaponBuff(input.weaponBuff, weapon.canApplyWeaponBuff === true, effectiveStats);
  const attackRating = appliedWeaponBuff
    ? addDamageTypes(baseAttackRating, appliedWeaponBuff.addedDamage)
    : baseAttackRating;
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
  const appliedDamageMultipliers = applyBuffMultipliers(applySupportedArmorDamageMultipliers(
    talismanDamageMultipliers,
    armorStats.passiveEffects.scopedDamageBoosts,
    "attackId" in input && input.attackId.includes("jumping"),
  ), selectedBuffs);
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
    buffs: selectedBuffs.map(({ id, name, buffEffect }) => ({
      id, name, slot: buffEffect!.slot, durationSeconds: buffEffect!.durationSeconds,
    })),
    weaponBuff: appliedWeaponBuff?.metadata ?? null,
    ...calculation,
    limitations: [
      ...(appliedWeaponBuff?.metadata.limitations ?? []),
      "Unmodeled status effects and special mechanics are not included.",
    ],
  };
}

async function resolveWeaponBuff(
  selection: WeaponDamageInput["weaponBuff"],
  canApplyWeaponBuff: boolean,
  stats: WeaponDamageInput["stats"],
) {
  if (!selection) return null;
  if (!canApplyWeaponBuff) throw createError(400, "Selected weapon cannot receive weapon buffs");
  const [spell, catalystCatalog, catalystData] = await Promise.all([
    findSpellById(selection.spellId, settings.SUPPORTED_GAME_VERSION),
    findWeaponCatalogById(selection.catalystWeaponId, settings.SUPPORTED_GAME_VERSION),
    findWeaponCalculationData(selection.catalystVariantId, settings.SUPPORTED_GAME_VERSION),
  ]);
  if (!spell?.buffEffect || spell.buffEffect.slot !== "weapon") {
    throw createError(400, "Unsupported weapon buff spell");
  }
  if (!catalystCatalog || !catalystData ||
      !catalystCatalog.variants.some(({ id }) => id === selection.catalystVariantId) ||
      !catalystCatalog.castingTypes.includes(spell.type)) {
    throw createError(400, "Invalid weapon buff catalyst");
  }
  const { weapon: catalyst, dataSet } = catalystData;
  if (selection.upgradeLevel > catalyst.maxUpgradeLevel) throw createError(400, "Invalid buff catalyst upgrade level");
  if (Object.entries(catalyst.requirements).some(([attribute, requirement]) =>
    stats[attribute as keyof typeof stats] < requirement) ||
    stats.intelligence < spell.requirements.intelligence ||
    stats.faith < spell.requirements.faith ||
    stats.arcane < spell.requirements.arcane) {
    throw createError(400, "Weapon buff attribute requirements not met");
  }
  const coefficients = spell.buffEffect.weaponAddedDamageScaling;
  const addedDamage = Object.fromEntries(Object.entries(coefficients).map(([damageType, coefficient]) => [
    damageType,
    coefficient === 0 ? 0 : Math.floor(calculateCatalystScaling(
      catalyst, selection.upgradeLevel, stats, damageType as keyof typeof coefficients, dataSet,
    ) * coefficient),
  ])) as ReturnType<typeof unitDamageTypes>;
  return {
    addedDamage,
    metadata: {
      id: spell.id, name: spell.name, durationSeconds: spell.buffEffect.durationSeconds,
      catalystWeaponId: catalystCatalog.id, catalystVariantId: catalyst.id,
      upgradeLevel: selection.upgradeLevel, addedDamage,
      addedStatusBuildup: spell.buffEffect.weaponAddedStatusBuildup,
      limitations: spell.buffEffect.limitations,
    },
  };
}

function addDamageTypes(left: ReturnType<typeof unitDamageTypes>, right: ReturnType<typeof unitDamageTypes>) {
  return {
    physical: left.physical + right.physical,
    magic: left.magic + right.magic,
    fire: left.fire + right.fire,
    lightning: left.lightning + right.lightning,
    holy: left.holy + right.holy,
  };
}

function validateGeneralBuffs<T extends { id: string; name: string; buffEffect: { slot: string; durationSeconds: number; outgoingDamageMultipliers: ReturnType<typeof unitDamageTypes> } | null }>(
  requestedIds: string[],
  buffs: T[],
) {
  if (buffs.length !== requestedIds.length || buffs.some(({ buffEffect }) => !buffEffect)) {
    throw createError(400, "Unsupported buff spell selection");
  }
  const byId = new Map(buffs.map((buff) => [buff.id, buff]));
  const selected = requestedIds.map((id) => byId.get(id)!);
  if (selected.some(({ buffEffect }) => buffEffect!.slot === "weapon")) {
    throw createError(400, "Weapon buff spells require a catalyst selection");
  }
  if (new Set(selected.map(({ buffEffect }) => buffEffect!.slot)).size !== selected.length) {
    throw createError(400, "Only one active buff per slot is allowed");
  }
  return selected;
}

function applyBuffMultipliers<T extends { buffEffect: { outgoingDamageMultipliers: ReturnType<typeof unitDamageTypes> } | null }>(
  multipliers: ReturnType<typeof unitDamageTypes>,
  buffs: T[],
) {
  return buffs.reduce((total, { buffEffect }) => ({
    physical: total.physical * buffEffect!.outgoingDamageMultipliers.physical,
    magic: total.magic * buffEffect!.outgoingDamageMultipliers.magic,
    fire: total.fire * buffEffect!.outgoingDamageMultipliers.fire,
    lightning: total.lightning * buffEffect!.outgoingDamageMultipliers.lightning,
    holy: total.holy * buffEffect!.outgoingDamageMultipliers.holy,
  }), multipliers);
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
