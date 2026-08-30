import { settings } from "../../../config/settings";
import { createError } from "../../../shared/errors/createError";
import { findTalismansByIds } from "../../talismans/repositories/talisman.repository";
import type { CalculateBuildStatsInput } from "../schemas/buildStats.schema";
import { calculateBuildStats } from "../domain/calculateBuildStats";
import { findCharacterClassById, findCharacterResourceCurves } from "../../characterClasses/repositories/characterClass.repository";
import { calculateCharacterLevel } from "../domain/calculateCharacterLevel";
import { applyResourceMultipliers, calculateBaseCharacterResources } from "../domain/calculateCharacterResources";
import { calculateCharacterProtection } from "../domain/calculateCharacterProtection";
import { findArmorByIds } from "../../armor/repositories/armor.repository";
import { calculateArmorStats } from "../domain/calculateArmorStats";
import { findWeaponCatalogByIds } from "../../weapons/repositories/weapon.repository";
import { calculateEquipmentLoad } from "../domain/calculateEquipmentLoad";

export async function calculateBuildStatsFromInput(input: CalculateBuildStatsInput) {
  const [characterClass, progression, talismans, armor, weapons] = await Promise.all([
    findCharacterClassById(input.characterClassId, settings.SUPPORTED_GAME_VERSION),
    findCharacterResourceCurves(settings.SUPPORTED_GAME_VERSION),
    findTalismansByIds(input.talismanIds, settings.SUPPORTED_GAME_VERSION),
    findArmorByIds(input.armorIds, settings.SUPPORTED_GAME_VERSION),
    findWeaponCatalogByIds(input.weaponIds, settings.SUPPORTED_GAME_VERSION),
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
  if (weapons.length !== input.weaponIds.length) throw createError(400, "Unknown weapon selection");
  const talismansById = new Map(talismans.map((talisman) => [talisman.id, talisman]));
  const selectedTalismans = input.talismanIds.map((id) => talismansById.get(id)!);
  const armorById = new Map(armor.map((item) => [item.id, item]));
  const selectedArmor = input.armorIds.map((id) => armorById.get(id)!);
  const weaponsById = new Map(weapons.map((weapon) => [weapon.id, weapon]));
  const selectedWeapons = input.weaponIds.map((id) => weaponsById.get(id)!);
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

  const buildStats = calculateBuildStats(
      input.stats,
      selectedTalismans.map(({ effects }) => effects!),
    );
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
  const statusResistances = Object.fromEntries(
    Object.entries(protection.statusResistances).map(([name, value]) => [
      name,
      value
        + buildStats.statusResistanceBonuses[name as keyof typeof buildStats.statusResistanceBonuses]
        + armorStats.resistanceBonuses[name as keyof typeof armorStats.resistanceBonuses],
    ]),
  );

  return {
    ...buildStats,
    baseResources,
    resources,
    equipmentLoad,
    defenses: protection.defenses,
    baseStatusResistances: protection.statusResistances,
    statusResistances,
    itemDiscovery: protection.itemDiscovery + buildStats.itemDiscoveryBonus,
    armorStats: {
      equipmentWeight: armorStats.equipmentWeight,
      poise: armorStats.poise,
      damageNegation: armorStats.damageNegation,
      hasUnresolvedPassiveEffects: armorStats.hasUnresolvedPassiveEffects,
    },
    characterClass: {
      id: characterClass.id,
      name: characterClass.name,
      startingLevel: characterClass.level,
    },
    characterLevel,
    talismans: selectedTalismans.map(({ id, name }) => ({ id, name })),
    armor: selectedArmor.map(({ id, name, slot }) => ({ id, name, slot })),
    weapons: selectedWeapons.map(({ id, name }) => ({ id, name })),
  };
}
