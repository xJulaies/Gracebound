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
import { findCompatibleAshOfWarAttack, findCompatibleAshOfWarBuff } from "../../ashesOfWar/repositories/ashOfWar.repository";
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
import { findGreatRuneById } from "../../greatRunes/repositories/greatRune.repository";
import {
  applyOutgoingBuffMultipliers,
  resolveGeneralBuffSelection,
  validateWeaponBuffExclusivity,
} from "../../buffs/domain/buffRules";
import { findCrystalTearsByIds } from "../../crystalTears/repositories/crystalTear.repository";
import { combineCrystalTearEffects } from "../../crystalTears/domain/combineCrystalTearEffects";
import { calculateWeaponTalismanMultipliers } from "../domain/calculateWeaponTalismanMultipliers";

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
  const [spell, catalystCatalog, catalystData, talismans, buffs, greatRune, crystalTears] = await Promise.all([
    findSpellById(input.spellId, settings.SUPPORTED_GAME_VERSION),
    findWeaponCatalogById(input.catalystWeaponId, settings.SUPPORTED_GAME_VERSION),
    findWeaponCalculationData(input.catalystVariantId, settings.SUPPORTED_GAME_VERSION),
    findTalismansByIds(input.talismanIds, settings.SUPPORTED_GAME_VERSION),
    findSpellsByIds(input.buffSpellIds, settings.SUPPORTED_GAME_VERSION),
    loadSelectedGreatRune(input.greatRuneId),
    loadSelectedCrystalTears(input.crystalTearIds),
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
  const selectedBuffs = resolveGeneralBuffs(input.buffSpellIds, buffs);
  const physickEffects = combineCrystalTearEffects(crystalTears.map(({ effects }) => effects!));
  if (!catalystCatalog.variants.some(({ id }) => id === input.catalystVariantId)) {
    throw createError(400, "Catalyst variant does not belong to selected weapon");
  }
  if (!catalystCatalog.castingTypes.includes(spell.type)) {
    throw createError(400, "Catalyst cannot cast selected spell");
  }
  const { weapon, dataSet } = catalystData;
  if (input.upgradeLevel > weapon.maxUpgradeLevel) throw createError(400, "Invalid catalyst upgrade level");
  const effectiveStats = applyAttributeBonuses(input.stats, [
    ...selectedTalismans.map(({ effects }) => effects!),
    ...(greatRune?.effects ? [greatRune.effects] : []),
    physickEffects,
  ]);
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
  const damageMultipliers = multiplyDamageTypes(
    applyOutgoingBuffMultipliers(talismanMultipliers, selectedBuffs),
    input.charged
      ? multiplyDamageTypes(physickEffects.outgoingDamageMultipliers, physickEffects.chargedAttackDamageMultipliers)
      : physickEffects.outgoingDamageMultipliers,
  );
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
    greatRune: greatRune ? { id: greatRune.id, name: greatRune.name } : null,
    crystalTears: crystalTears.map(({ id, name }) => ({ id, name })),
    physickRecovery: physickEffects.recovery,
    talismans: selectedTalismans.map(({ id, name }) => ({ id, name })),
    buffs: selectedBuffs.map(({ id, name, buffEffect }) => ({
      id, name, slot: buffEffect!.slot, durationSeconds: buffEffect!.durationSeconds,
    })),
    ...calculation,
    attack: { ...calculation.attack, fpCost: Math.floor(calculation.attack.fpCost * physickEffects.fpCostMultipliers[spell.type]) },
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
  const [calculationData, weaponCatalog, attack, talismans, armor, buffs, greatRune, crystalTears] = await Promise.all([
    findWeaponCalculationData(
      input.weaponVariantId,
      settings.SUPPORTED_GAME_VERSION,
    ),
    findWeaponCatalogById(input.weaponId, settings.SUPPORTED_GAME_VERSION),
    findSelectedAttack(input),
    findTalismansByIds(input.talismanIds, settings.SUPPORTED_GAME_VERSION),
    findArmorByIds(input.armorIds, settings.SUPPORTED_GAME_VERSION),
    findSpellsByIds(input.buffSpellIds, settings.SUPPORTED_GAME_VERSION),
    loadSelectedGreatRune(input.greatRuneId),
    loadSelectedCrystalTears(input.crystalTearIds),
  ]);

  if (!calculationData || !weaponCatalog) {
    throw createError(404, "Weapon not found");
  }
  const selectedVariant = weaponCatalog.variants.find(({ id }) => id === input.weaponVariantId);
  if (!selectedVariant) throw createError(400, "Weapon variant does not belong to selected weapon");

  if (!attack) {
    throw createError(404, "Weapon attack not found");
  }

  if (talismans.length !== input.talismanIds.length || talismans.some(({ effects }) => !effects)) {
    throw createError(400, "Unsupported talisman selection");
  }
  if (armor.length !== input.armorIds.length) throw createError(400, "Unknown armor selection");
  const selectedBuffs = resolveGeneralBuffs(input.buffSpellIds, buffs);
  const physickEffects = combineCrystalTearEffects(crystalTears.map(({ effects }) => effects!));
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
    [
      armorStats.passiveEffects,
      ...(greatRune?.effects ? [greatRune.effects] : []),
      physickEffects,
    ],
  );
  const baseAttackRating = calculateAttackRating(
    weapon,
    input.upgradeLevel,
    effectiveStats,
    dataSet,
  );
  const appliedWeaponBuff = await resolveWeaponBuff(input.weaponBuff, weapon.canApplyWeaponBuff === true, effectiveStats);
  const appliedSkillBuff = await resolveSkillBuff(input);
  assertWeaponBuffExclusivity(Boolean(appliedWeaponBuff), Boolean(appliedSkillBuff));
  const skillAdjustedAttackRating = appliedSkillBuff
    ? addDamageTypes(
      multiplyAttackRating(baseAttackRating, appliedSkillBuff.effect.attackPowerMultipliers),
      appliedSkillBuff.effect.addedDamage,
    )
    : baseAttackRating;
  const attackRating = appliedWeaponBuff
    ? addDamageTypes(skillAdjustedAttackRating, appliedWeaponBuff.addedDamage)
    : skillAdjustedAttackRating;
  const talismanDamageMultipliers = calculateWeaponTalismanMultipliers(
    talismans.map(({ effects }) => effects!),
    input,
  );
  const physickDamageMultipliers = "attackId" in input && input.attackId.includes("charged-heavy")
    ? multiplyDamageTypes(physickEffects.outgoingDamageMultipliers, physickEffects.chargedAttackDamageMultipliers)
    : physickEffects.outgoingDamageMultipliers;
  const appliedDamageMultipliers = multiplyDamageTypes(
    multiplyDamageTypes(
      applyOutgoingBuffMultipliers(applySupportedArmorDamageMultipliers(
        talismanDamageMultipliers,
        armorStats.passiveEffects.scopedDamageBoosts,
        "attackId" in input && input.attackId.includes("jumping"),
      ), selectedBuffs),
      physickDamageMultipliers,
    ),
    appliedSkillBuff?.effect.outgoingDamageMultipliers ?? unitDamageTypes(),
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
      affinity: selectedVariant.affinity,
    },
    stats: input.stats,
    effectiveStats,
    greatRune: greatRune ? { id: greatRune.id, name: greatRune.name } : null,
    crystalTears: crystalTears.map(({ id, name }) => ({ id, name })),
    physickRecovery: physickEffects.recovery,
    talismans: talismans.map(({ id, name }) => ({ id, name })),
    armor: armor.map(({ id, name, slot }) => ({ id, name, slot })),
    buffs: selectedBuffs.map(({ id, name, buffEffect }) => ({
      id, name, slot: buffEffect!.slot, durationSeconds: buffEffect!.durationSeconds,
    })),
    weaponBuff: appliedWeaponBuff?.metadata ?? null,
    skillBuff: appliedSkillBuff ? {
      id: appliedSkillBuff.id, name: appliedSkillBuff.name,
      ...appliedSkillBuff.effect,
    } : null,
    ...calculation,
    attack: {
      ...calculation.attack,
      fpCost: Math.floor(calculation.attack.fpCost * physickEffects.fpCostMultipliers.skill),
    },
    poiseDamageMultiplier: physickEffects.poiseDamageMultiplier,
    limitations: [
      ...(appliedWeaponBuff?.metadata.limitations ?? []),
      ...(appliedSkillBuff?.effect.limitations ?? []),
      "Unmodeled status effects and special mechanics are not included.",
    ],
  };
}

async function loadSelectedGreatRune(greatRuneId: string | null) {
  if (!greatRuneId) return null;
  const greatRune = await findGreatRuneById(greatRuneId, settings.SUPPORTED_GAME_VERSION);
  if (!greatRune?.effects) throw createError(400, "Unsupported Great Rune selection");
  return greatRune;
}

async function loadSelectedCrystalTears(ids: string[]) {
  const tears = await findCrystalTearsByIds(ids, settings.SUPPORTED_GAME_VERSION);
  if (tears.length !== ids.length || tears.some(({ effects }) => !effects)) {
    throw createError(400, "Unsupported Crystal Tear selection");
  }
  const byId = new Map(tears.map((tear) => [tear.id, tear]));
  return ids.map((id) => byId.get(id)!);
}

async function resolveSkillBuff(input: WeaponDamageInput) {
  if (!input.skillBuffAshOfWarId) return null;
  const weapon = await findWeaponCatalogById(input.weaponId, settings.SUPPORTED_GAME_VERSION);
  if (!weapon?.weaponType) throw createError(400, "Invalid skill-buff weapon");
  const variant = weapon.variants.find(({ id }) => id === input.weaponVariantId);
  if (!variant) throw createError(400, "Invalid skill-buff weapon variant");
  const ash = await findCompatibleAshOfWarBuff(
    input.skillBuffAshOfWarId, weapon.weaponType, variant.affinity, settings.SUPPORTED_GAME_VERSION,
  );
  if (!ash?.buffEffect) throw createError(400, "Unsupported skill buff selection");
  return { id: ash.id, name: ash.name, effect: ash.buffEffect };
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

function multiplyDamageTypes(left: ReturnType<typeof unitDamageTypes>, right: ReturnType<typeof unitDamageTypes>) {
  return {
    physical: left.physical * right.physical,
    magic: left.magic * right.magic,
    fire: left.fire * right.fire,
    lightning: left.lightning * right.lightning,
    holy: left.holy * right.holy,
  };
}

function multiplyAttackRating(left: ReturnType<typeof unitDamageTypes>, right: ReturnType<typeof unitDamageTypes>) {
  return Object.fromEntries(Object.entries(left).map(([type, value]) => [
    type, Math.floor(value * right[type as keyof typeof right]),
  ])) as ReturnType<typeof unitDamageTypes>;
}

function resolveGeneralBuffs<T extends { id: string; name: string; buffEffect: { slot: string; durationSeconds: number; outgoingDamageMultipliers: ReturnType<typeof unitDamageTypes> } | null }>(
  requestedIds: string[],
  buffs: T[],
) {
  try {
    return resolveGeneralBuffSelection(requestedIds, buffs);
  } catch (error) {
    throw createError(400, error instanceof Error ? error.message : "Invalid buff selection");
  }
}

function assertWeaponBuffExclusivity(hasSpellWeaponBuff: boolean, hasSkillWeaponBuff: boolean) {
  try {
    validateWeaponBuffExclusivity(hasSpellWeaponBuff, hasSkillWeaponBuff);
  } catch (error) {
    throw createError(400, error instanceof Error ? error.message : "Invalid weapon buff selection");
  }
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
    const variant = weapon.variants.find(({ id }) => id === input.weaponVariantId);
    if (!variant) return null;

    return findCompatibleAshOfWarAttack(
      input.ashOfWarId,
      input.skillAttackId,
      weapon.weaponType,
      variant.affinity,
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
