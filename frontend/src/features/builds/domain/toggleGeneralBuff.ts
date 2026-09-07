import type { Spell } from "../../spells/types/spell.types";

export function toggleGeneralBuff(
  activeIds: string[],
  toggledSpell: Spell,
  selectedSpells: Spell[],
) {
  if (activeIds.includes(toggledSpell.id)) {
    return activeIds.filter((id) => id !== toggledSpell.id);
  }
  const slot = toggledSpell.buffEffect?.slot;
  if (slot !== "aura" && slot !== "body") return activeIds;
  const selectedById = new Map(selectedSpells.map((spell) => [spell.id, spell]));
  return [
    ...activeIds.filter((id) => selectedById.get(id)?.buffEffect?.slot !== slot),
    toggledSpell.id,
  ];
}
