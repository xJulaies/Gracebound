import type { SpellData } from "../../spells/domain/spell.types";

const BASE_MEMORY_SLOTS = 2;

export function calculateMemorySlots(
  memoryStoneCount: number,
  talismanSlotBonus: number,
  spells: Pick<SpellData, "slotsRequired">[],
) {
  const availableSlots = BASE_MEMORY_SLOTS + memoryStoneCount + talismanSlotBonus;
  const usedSlots = spells.reduce((total, spell) => total + spell.slotsRequired, 0);

  if (usedSlots > availableSlots) {
    throw new Error("Selected spells exceed available memory slots");
  }

  return {
    availableSlots,
    usedSlots,
    remainingSlots: availableSlots - usedSlots,
  };
}
