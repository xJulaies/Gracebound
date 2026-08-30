import type { CharacterStats } from "./buildStats.types";
import type { CharacterClassData } from "../../characterClasses/domain/characterClass.types";

export function calculateCharacterLevel(
  characterClass: CharacterClassData,
  stats: CharacterStats,
) {
  const investedLevels = (Object.keys(stats) as Array<keyof CharacterStats>)
    .reduce((total, key) => {
      const invested = stats[key] - characterClass.stats[key];
      if (invested < 0) {
        throw new Error(`${key} cannot be lower than the ${characterClass.name} starting value`);
      }
      return total + invested;
    }, 0);
  return characterClass.level + investedLevels;
}
