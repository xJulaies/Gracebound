import type { CharacterClass } from "../../character-classes/types/characterClass.types";
import type { BuildStatsInput, BuildStats } from "../types/build.types";

export function createCharacterClassSelection(
  characterClass: CharacterClass,
): BuildStatsInput {
  return {
    characterClassId: characterClass.id,
    stats: { ...characterClass.stats },
    talismanIds: [],
    armorIds: [],
    weaponIds: [],
    greatRuneId: null,
    crystalTearIds: [],
  };
}

export function changeCharacterClass(
  currentStats: BuildStats,
  characterClass: CharacterClass,
): BuildStatsInput {
  return {
    characterClassId: characterClass.id,
    talismanIds: [],
    armorIds: [],
    weaponIds: [],
    greatRuneId: null,
    crystalTearIds: [],
    stats: {
      vigor: Math.max(currentStats.vigor, characterClass.stats.vigor),
      mind: Math.max(currentStats.mind, characterClass.stats.mind),
      endurance: Math.max(currentStats.endurance, characterClass.stats.endurance),
      strength: Math.max(currentStats.strength, characterClass.stats.strength),
      dexterity: Math.max(currentStats.dexterity, characterClass.stats.dexterity),
      intelligence: Math.max(
        currentStats.intelligence,
        characterClass.stats.intelligence,
      ),
      faith: Math.max(currentStats.faith, characterClass.stats.faith),
      arcane: Math.max(currentStats.arcane, characterClass.stats.arcane),
    },
  };
}
