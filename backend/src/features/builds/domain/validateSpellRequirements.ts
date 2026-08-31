import type { SpellData } from "../../spells/domain/spell.types";
import type { CharacterStats } from "./buildStats.types";

export function validateSpellRequirements(
  spells: Pick<SpellData, "name" | "requirements">[],
  effectiveStats: CharacterStats,
) {
  for (const spell of spells) {
    const meetsRequirements =
      effectiveStats.intelligence >= spell.requirements.intelligence &&
      effectiveStats.faith >= spell.requirements.faith &&
      effectiveStats.arcane >= spell.requirements.arcane;

    if (!meetsRequirements) {
      throw new Error(`Attribute requirements not met for ${spell.name}`);
    }
  }
}
