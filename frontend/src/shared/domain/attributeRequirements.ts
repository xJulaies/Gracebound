import type { CharacterStats } from "../types/game.types";

export type AttributeRequirementsValue = Partial<Record<keyof CharacterStats, number>>;

const ATTRIBUTE_ORDER: Array<keyof CharacterStats> = [
  "vigor", "mind", "endurance", "strength", "dexterity",
  "intelligence", "faith", "arcane",
];

export function getAttributeRequirementEntries(
  requirements: AttributeRequirementsValue,
  currentStats: CharacterStats | null,
) {
  return ATTRIBUTE_ORDER.flatMap((attribute) => {
    const required = requirements[attribute] ?? 0;
    const current = currentStats?.[attribute];
    return required > 0 ? [{
      attribute,
      required,
      current,
      isMet: current === undefined ? null : current >= required,
    }] : [];
  });
}

export function getUnmetAttributeRequirements(
  requirements: AttributeRequirementsValue,
  currentStats: CharacterStats,
) {
  return getAttributeRequirementEntries(requirements, currentStats)
    .filter(({ isMet }) => isMet === false);
}
