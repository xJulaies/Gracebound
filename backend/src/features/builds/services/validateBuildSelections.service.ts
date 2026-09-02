import { settings } from "../../../config/settings";
import { createError } from "../../../shared/errors/createError";
import { findSpellsByIds } from "../../spells/repositories/spell.repository";
import { findWeaponCatalogById, findWeaponCalculationData } from "../../weapons/repositories/weapon.repository";
import type { CreateBuildInput } from "../schemas/build.schema";
import { calculateBuildStatsFromInput } from "./calculateBuildStats.service";
import { findAshOfWarById } from "../../ashesOfWar/repositories/ashOfWar.repository";
import { findArmorByIds } from "../../armor/repositories/armor.repository";
import { findTalismansByIds } from "../../talismans/repositories/talisman.repository";
import { calculateArmorStats } from "../domain/calculateArmorStats";
import { findGreatRuneById } from "../../greatRunes/repositories/greatRune.repository";
import { resolveGeneralBuffSelection } from "../../buffs/domain/buffRules";
import { findCrystalTearsByIds } from "../../crystalTears/repositories/crystalTear.repository";

export async function validateBuildBuffSelection(equipment: CreateBuildInput["equipment"]) {
  const requestedSpellIds = [
    ...equipment.buffSpellIds,
    ...(equipment.weaponBuff ? [equipment.weaponBuff.spellId] : []),
  ];
  if (requestedSpellIds.length === 0) return;

  const spells = await findSpellsByIds(requestedSpellIds, settings.SUPPORTED_GAME_VERSION);
  if (spells.length !== requestedSpellIds.length || spells.some(({ calculationStatus }) => calculationStatus !== "supported")) {
    throw createError(400, "Unsupported build buff selection");
  }
  const spellsById = new Map(spells.map((spell) => [spell.id, spell]));
  const generalBuffs = equipment.buffSpellIds.map((id) => spellsById.get(id)!);
  try {
    resolveGeneralBuffSelection(equipment.buffSpellIds, generalBuffs);
  } catch (error) {
    throw createError(400, error instanceof Error ? error.message : "Invalid build buff slot combination");
  }

  if (!equipment.weaponBuff) return;
  const buffSpell = spellsById.get(equipment.weaponBuff.spellId)!;
  if (!buffSpell.buffEffect || buffSpell.buffEffect.slot !== "weapon") {
    throw createError(400, "Invalid build weapon buff");
  }
  const [catalyst, catalystData] = await Promise.all([
    findWeaponCatalogById(equipment.weaponBuff.catalystWeaponId, settings.SUPPORTED_GAME_VERSION),
    findWeaponCalculationData(equipment.weaponBuff.catalystVariantId, settings.SUPPORTED_GAME_VERSION),
  ]);
  if (!catalyst || !catalystData ||
      !catalyst.variants.some(({ id }) => id === equipment.weaponBuff!.catalystVariantId) ||
      !catalyst.castingTypes.includes(buffSpell.type) ||
      equipment.weaponBuff.upgradeLevel > catalystData.weapon.maxUpgradeLevel) {
    throw createError(400, "Invalid build weapon buff catalyst");
  }
}

export async function validateBuildCatalogSelections(input: CreateBuildInput) {
  await validateBuildBuffSelection(input.equipment);
  const weaponSlots = Object.values(input.equipment.weaponSlots).filter((slot) => slot !== null);
  await validateWeaponSlots(weaponSlots);
  if (input.characterClassId) {
    const result = await calculateBuildStatsFromInput({
      characterClassId: input.characterClassId,
      stats: input.stats,
      greatRuneId: input.equipment.greatRuneId,
      crystalTearIds: input.equipment.crystalTearIds,
      memoryStoneCount: input.memoryStoneCount,
      talismanIds: input.equipment.talismanIds,
      armorIds: Object.values(input.equipment.armor).filter((id): id is string => id !== null),
      weaponIds: weaponSlots.map(({ weaponId }) => weaponId),
      spellIds: input.spellIds,
      catalyst: input.equipment.catalyst,
    });
    if (result.characterLevel !== input.level) {
      throw createError(400, "Build level does not match character class and attributes");
    }
  } else {
    const armorIds = Object.values(input.equipment.armor).filter((id): id is string => id !== null);
    const [spells, armor, talismans, greatRune, crystalTears] = await Promise.all([
      findSpellsByIds(input.spellIds, settings.SUPPORTED_GAME_VERSION),
      findArmorByIds(armorIds, settings.SUPPORTED_GAME_VERSION),
      findTalismansByIds(input.equipment.talismanIds, settings.SUPPORTED_GAME_VERSION),
      input.equipment.greatRuneId
        ? findGreatRuneById(input.equipment.greatRuneId, settings.SUPPORTED_GAME_VERSION)
        : null,
      findCrystalTearsByIds(input.equipment.crystalTearIds, settings.SUPPORTED_GAME_VERSION),
    ]);
    if (spells.length !== input.spellIds.length) throw createError(400, "Unknown build spell selection");
    if (armor.length !== armorIds.length) throw createError(400, "Unknown build armor selection");
    if (talismans.length !== input.equipment.talismanIds.length || talismans.some(({ effects }) => !effects)) {
      throw createError(400, "Unsupported build talisman selection");
    }
    if (input.equipment.greatRuneId && (!greatRune || !greatRune.effects)) {
      throw createError(400, "Unsupported build Great Rune selection");
    }
    if (crystalTears.length !== input.equipment.crystalTearIds.length || crystalTears.some(({ effects }) => !effects)) {
      throw createError(400, "Unsupported build Crystal Tear selection");
    }
    try {
      const byId = new Map(armor.map((item) => [item.id, item]));
      calculateArmorStats(armorIds.map((id) => byId.get(id)!));
    } catch (error) {
      throw createError(400, error instanceof Error ? error.message : "Invalid build armor selection");
    }
    if (input.equipment.catalyst) {
      const [catalog, data] = await Promise.all([
        findWeaponCatalogById(input.equipment.catalyst.weaponId, settings.SUPPORTED_GAME_VERSION),
        findWeaponCalculationData(input.equipment.catalyst.variantId, settings.SUPPORTED_GAME_VERSION),
      ]);
      if (!catalog || !data ||
          !catalog.variants.some(({ id }) => id === input.equipment.catalyst!.variantId) ||
          input.equipment.catalyst.upgradeLevel > data.weapon.maxUpgradeLevel ||
          spells.some(({ type }) => !catalog.castingTypes.includes(type))) {
        throw createError(400, "Invalid build spell catalyst");
      }
    }
  }
  for (const slot of weaponSlots) {
    if (!slot.ashOfWarId) continue;
    const [ashOfWar, weapon] = await Promise.all([
      findAshOfWarById(slot.ashOfWarId, settings.SUPPORTED_GAME_VERSION),
      findWeaponCatalogById(slot.weaponId, settings.SUPPORTED_GAME_VERSION),
    ]);
    const variant = weapon?.variants.find(({ id }) => id === slot.variantId);
    if (!ashOfWar || !weapon || !variant || !weapon.weaponType ||
        !ashOfWar.compatibleWeaponTypes.includes(weapon.weaponType) ||
        !ashOfWar.compatibleAffinities.includes(variant.affinity)) {
      throw createError(400, "Incompatible build Ash of War selection");
    }
  }
}

async function validateWeaponSlots(weaponSlots: CreateBuildInput["equipment"]["weaponSlots"][keyof CreateBuildInput["equipment"]["weaponSlots"]][]) {
  const selectedSlots = weaponSlots.filter((slot) => slot !== null);
  const [catalogs, dataSets] = await Promise.all([
    Promise.all(selectedSlots.map(({ weaponId }) =>
      findWeaponCatalogById(weaponId, settings.SUPPORTED_GAME_VERSION))),
    Promise.all(selectedSlots.map(({ variantId }) =>
      findWeaponCalculationData(variantId, settings.SUPPORTED_GAME_VERSION))),
  ]);
  if (selectedSlots.some((slot, index) => {
    const catalog = catalogs[index];
    const data = dataSets[index];
    return !catalog || !data || !catalog.variants.some(({ id }) => id === slot.variantId) ||
      slot.upgradeLevel > data.weapon.maxUpgradeLevel;
  })) throw createError(400, "Invalid build weapon selection");
}
