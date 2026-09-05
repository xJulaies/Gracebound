import { settings } from "../../../config/settings";
import { createError } from "../../../shared/errors/createError";
import { findTalismansByIds } from "../../talismans/repositories/talisman.repository";
import type { CalculateBuildStatsInput } from "../schemas/buildStats.schema";
import { applyAttributeBonuses, calculateBuildStats } from "../domain/calculateBuildStats";
import { findCharacterClassById, findCharacterResourceCurves } from "../../characterClasses/repositories/characterClass.repository";
import { calculateCharacterLevel } from "../domain/calculateCharacterLevel";
import { applyResourceMultipliers, calculateBaseCharacterResources } from "../domain/calculateCharacterResources";
import { calculateCharacterProtection } from "../domain/calculateCharacterProtection";
import { findArmorByIds } from "../../armor/repositories/armor.repository";
import { calculateArmorStats } from "../domain/calculateArmorStats";
import { findWeaponCatalogById, findWeaponCatalogByIds, findWeaponCalculationData } from "../../weapons/repositories/weapon.repository";
import { calculateEquipmentLoad } from "../domain/calculateEquipmentLoad";
import { findSpellsByIds } from "../../spells/repositories/spell.repository";
import { calculateMemorySlots } from "../domain/calculateMemorySlots";
import { validateSpellRequirements } from "../domain/validateSpellRequirements";
import { calculateCatalystScaling } from "../../weapons/domain/calculateAttackRating";
import type { SpellType } from "../../spells/domain/spell.types";
import { findGreatRuneById } from "../../greatRunes/repositories/greatRune.repository";
import { findCrystalTearsByIds } from "../../crystalTears/repositories/crystalTear.repository";
import { combineCrystalTearEffects } from "../../crystalTears/domain/combineCrystalTearEffects";
import { calculateRuneCosts } from "../domain/calculateRuneCosts";

export async function calculateBuildStatsFromInput(input: CalculateBuildStatsInput) {
  const [characterClass, progression, talismans, armor, weapons, spells, catalystCatalog, catalystData, greatRune, crystalTears] = await Promise.all([
    findCharacterClassById(input.characterClassId, settings.SUPPORTED_GAME_VERSION),
    findCharacterResourceCurves(settings.SUPPORTED_GAME_VERSION),
    findTalismansByIds(input.talismanIds, settings.SUPPORTED_GAME_VERSION),
    findArmorByIds(input.armorIds, settings.SUPPORTED_GAME_VERSION),
    findWeaponCatalogByIds([...new Set(input.weaponIds)], settings.SUPPORTED_GAME_VERSION),
    findSpellsByIds(input.spellIds, settings.SUPPORTED_GAME_VERSION),
    input.catalyst
      ? findWeaponCatalogById(input.catalyst.weaponId, settings.SUPPORTED_GAME_VERSION)
      : null,
    input.catalyst
      ? findWeaponCalculationData(input.catalyst.variantId, settings.SUPPORTED_GAME_VERSION)
      : null,
    input.greatRuneId
      ? findGreatRuneById(input.greatRuneId, settings.SUPPORTED_GAME_VERSION)
      : null,
    findCrystalTearsByIds(input.crystalTearIds, settings.SUPPORTED_GAME_VERSION),
  ]);
  if (!characterClass) throw createError(400, "Unknown character class");
  if (!progression) throw createError(500, "Character progression data is unavailable");
  if (
    talismans.length !== input.talismanIds.length ||
    talismans.some(({ effects }) => !effects)
  ) {
    throw createError(400, "Unsupported talisman selection");
  }
  if (armor.length !== input.armorIds.length) throw createError(400, "Unknown armor selection");
  if (weapons.length !== new Set(input.weaponIds).size) throw createError(400, "Unknown weapon selection");
  if (spells.length !== input.spellIds.length) throw createError(400, "Unknown spell selection");
  if (input.greatRuneId && (!greatRune || !greatRune.effects)) {
    throw createError(400, "Unsupported Great Rune selection");
  }
  if (crystalTears.length !== input.crystalTearIds.length || crystalTears.some(({ effects }) => !effects)) {
    throw createError(400, "Unsupported Crystal Tear selection");
  }
  const talismansById = new Map(talismans.map((talisman) => [talisman.id, talisman]));
  const selectedTalismans = input.talismanIds.map((id) => talismansById.get(id)!);
  const armorById = new Map(armor.map((item) => [item.id, item]));
  const selectedArmor = input.armorIds.map((id) => armorById.get(id)!);
  const weaponsById = new Map(weapons.map((weapon) => [weapon.id, weapon]));
  const selectedWeapons = input.weaponIds.map((id) => weaponsById.get(id)!);
  const spellsById = new Map(spells.map((spell) => [spell.id, spell]));
  const selectedSpells = input.spellIds.map((id) => spellsById.get(id)!);
  const crystalTearsById = new Map(crystalTears.map((tear) => [tear.id, tear]));
  const selectedCrystalTears = input.crystalTearIds.map((id) => crystalTearsById.get(id)!);
  const physickEffects = combineCrystalTearEffects(selectedCrystalTears.map(({ effects }) => effects!));
  let armorStats: ReturnType<typeof calculateArmorStats>;
  try {
    armorStats = calculateArmorStats(selectedArmor);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Invalid armor selection";
    throw createError(400, message);
  }

  let characterLevel: number;
  try {
    characterLevel = calculateCharacterLevel(characterClass, input.stats);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Invalid character stats";
    throw createError(400, message);
  }

  const talismanBuildStats = calculateBuildStats(
      input.stats,
      selectedTalismans.map(({ effects }) => effects!),
    );
  const buildStats = {
    ...talismanBuildStats,
    effectiveStats: applyAttributeBonuses(talismanBuildStats.effectiveStats, [
      armorStats.passiveEffects,
      ...(greatRune?.effects ? [greatRune.effects] : []),
      physickEffects,
    ]),
    resourceMultipliers: multiplyGroups(
      multiplyGroups(
        multiplyGroups(talismanBuildStats.resourceMultipliers, armorStats.passiveEffects.resourceMultipliers),
        greatRuneResourceMultipliers(greatRune?.effects?.resourceMultipliers),
      ),
      {
        maxHp: physickEffects.resourceMultipliers.maxHp,
        maxFp: 1,
        maxStamina: physickEffects.resourceMultipliers.maxStamina,
        maxEquipLoad: physickEffects.resourceMultipliers.maxEquipLoad,
      },
    ),
    incomingDamageMultipliers: multiplyGroups(
      multiplyGroups(talismanBuildStats.incomingDamageMultipliers, armorStats.passiveEffects.incomingDamageMultipliers),
      physickEffects.incomingDamageMultipliers,
    ),
    fpCostMultipliers: multiplyGroups(armorStats.passiveEffects.fpCostMultipliers, physickEffects.fpCostMultipliers),
    statusResistanceBonuses: addGroups(talismanBuildStats.statusResistanceBonuses, physickEffects.statusResistanceBonuses),
    staminaRecoverySpeedBonus: talismanBuildStats.staminaRecoverySpeedBonus + physickEffects.staminaRecoverySpeedBonus,
  };
  let catalyst: null | {
    weaponId: string;
    variantId: string;
    name: string;
    upgradeLevel: number;
    castingTypes: SpellType[];
    scaling: Record<"physical" | "magic" | "fire" | "lightning" | "holy", number>;
  } = null;
  if (input.catalyst) {
    if (!catalystCatalog || !catalystData) throw createError(400, "Unknown catalyst selection");
    if (!catalystCatalog.variants.some(({ id }) => id === input.catalyst!.variantId)) {
      throw createError(400, "Catalyst variant does not belong to selected weapon");
    }
    const selectedSpellTypes = new Set(selectedSpells.map(({ type }) => type));
    if ([...selectedSpellTypes].some((type) => !catalystCatalog.castingTypes.includes(type))) {
      throw createError(400, "Catalyst cannot cast every selected spell");
    }
    const { weapon, dataSet } = catalystData;
    if (input.catalyst.upgradeLevel > weapon.maxUpgradeLevel) {
      throw createError(400, `Invalid upgrade level for ${weapon.name}`);
    }
    if (Object.entries(weapon.requirements).some(([attribute, requirement]) =>
      buildStats.effectiveStats[attribute as keyof typeof weapon.requirements] < requirement)) {
      throw createError(400, `Attribute requirements not met for ${weapon.name}`);
    }
    const damageTypes = ["physical", "magic", "fire", "lightning", "holy"] as const;
    catalyst = {
      weaponId: catalystCatalog.id,
      variantId: weapon.id,
      name: catalystCatalog.name,
      upgradeLevel: input.catalyst.upgradeLevel,
      castingTypes: catalystCatalog.castingTypes,
      scaling: Object.fromEntries(damageTypes.map((damageType) => [
        damageType,
        calculateCatalystScaling(weapon, input.catalyst!.upgradeLevel, buildStats.effectiveStats, damageType, dataSet),
      ])) as Record<(typeof damageTypes)[number], number>,
    };
  }
  try {
    validateSpellRequirements(selectedSpells, buildStats.effectiveStats);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Spell requirements are not met";
    throw createError(400, message);
  }
  const talismanMemorySlotBonus = selectedTalismans.reduce(
    (total, talisman) => total + talisman.effects!.utilityEffects.memorySlotBonus,
    0,
  );
  let memorySlots: ReturnType<typeof calculateMemorySlots>;
  try {
    memorySlots = calculateMemorySlots(
      input.memoryStoneCount,
      talismanMemorySlotBonus,
      selectedSpells,
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Invalid spell selection";
    throw createError(400, message);
  }
  const baseResources = calculateBaseCharacterResources(
    buildStats.effectiveStats,
    progression.curves,
  );
  const resources = applyResourceMultipliers(baseResources, buildStats.resourceMultipliers);
  const equipmentLoad = calculateEquipmentLoad({
    armorWeight: armorStats.equipmentWeight,
    talismanWeights: selectedTalismans.map(({ weight }) => weight),
    weaponWeights: selectedWeapons.map(({ weight }) => weight),
    maxEquipLoad: resources.maxEquipLoad,
  });
  const protection = calculateCharacterProtection(
    characterLevel,
    buildStats.effectiveStats,
    progression.curves,
  );
  const runeCosts = calculateRuneCosts(characterClass.level, characterLevel);
  const statusResistances = Object.fromEntries(
    Object.entries(protection.statusResistances).map(([name, value]) => [
      name,
      value
        + buildStats.statusResistanceBonuses[name as keyof typeof buildStats.statusResistanceBonuses]
        + armorStats.resistanceBonuses[name as keyof typeof armorStats.resistanceBonuses]
        + armorStats.passiveEffects.statusResistanceBonuses[name as keyof typeof armorStats.passiveEffects.statusResistanceBonuses],
    ]),
  );

  return {
    ...buildStats,
    baseResources,
    resources,
    equipmentLoad,
    memorySlots,
    catalyst,
    defenses: protection.defenses,
    baseStatusResistances: protection.statusResistances,
    statusResistances,
    itemDiscovery: protection.itemDiscovery + buildStats.itemDiscoveryBonus,
    armorStats: {
      equipmentWeight: armorStats.equipmentWeight,
      poise: armorStats.poise,
      damageNegation: armorStats.damageNegation,
      passiveEffects: armorStats.passiveEffects,
      hasUnresolvedPassiveEffects: armorStats.hasUnresolvedPassiveEffects,
    },
    characterClass: {
      id: characterClass.id,
      name: characterClass.name,
      startingLevel: characterClass.level,
    },
    characterLevel,
    ...runeCosts,
    greatRune: greatRune ? { id: greatRune.id, name: greatRune.name } : null,
    crystalTears: selectedCrystalTears.map(({ id, name }) => ({ id, name })),
    cleansesStatusBuildup: physickEffects.cleansesStatusBuildup,
    physickRecovery: physickEffects.recovery,
    talismans: selectedTalismans.map(({ id, name }) => ({ id, name })),
    armor: selectedArmor.map(({ id, name, slot }) => ({ id, name, slot })),
    weapons: selectedWeapons.map(({ id, name }) => ({ id, name })),
    spells: selectedSpells.map(({ id, name, type, fpCost, slotsRequired, requirements, calculationStatus }) => ({
      id, name, type, fpCost, slotsRequired, requirements, calculationStatus,
    })),
  };
}

function greatRuneResourceMultipliers(
  multipliers: { maxHp: number; maxFp: number; maxStamina: number } | undefined,
) {
  return {
    maxHp: multipliers?.maxHp ?? 1,
    maxFp: multipliers?.maxFp ?? 1,
    maxStamina: multipliers?.maxStamina ?? 1,
    maxEquipLoad: 1,
  };
}

function multiplyGroups<T extends Record<string, number>>(left: T, right: T): T {
  return Object.fromEntries(
    (Object.keys(left) as Array<keyof T>).map((key) => [key, Number((left[key] * right[key]).toFixed(12))]),
  ) as T;
}

function addGroups<T extends Record<string, number>>(left: T, right: T): T {
  return Object.fromEntries((Object.keys(left) as Array<keyof T>).map((key) => [key, left[key] + right[key]])) as T;
}
