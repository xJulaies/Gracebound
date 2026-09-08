import type { ArmorSlot } from "../../armor/types/armor.types";
import type { WeaponEditorSlotId } from "../types/editor.types";

export const weaponSlotLabels: Record<WeaponEditorSlotId, string> = {
  "left-hand-1": "Left hand 1",
  "left-hand-2": "Left hand 2",
  "left-hand-3": "Left hand 3",
  "right-hand-1": "Right hand 1",
  "right-hand-2": "Right hand 2",
  "right-hand-3": "Right hand 3",
};

export const armorSlots: Record<string, { label: string; slot: ArmorSlot }> = {
  "armor-head": { label: "Head", slot: "head" },
  "armor-body": { label: "Body", slot: "body" },
  "armor-arms": { label: "Arms", slot: "arms" },
  "armor-legs": { label: "Legs", slot: "legs" },
};

export const talismanSlotLabels: Record<string, string> = {
  "talisman-1": "Talisman 1",
  "talisman-2": "Talisman 2",
  "talisman-3": "Talisman 3",
  "talisman-4": "Talisman 4",
};

export const crystalTearSlotLabels: Record<string, string> = {
  "crystal-tear-1": "Crystal Tear 1",
  "crystal-tear-2": "Crystal Tear 2",
};

export function parseSpellSlot(slotId: string): number | null {
  const match = /^spell-(\d{1,2})$/.exec(slotId);
  if (!match) return null;
  const slot = Number(match[1]);
  return slot >= 1 && slot <= 12 ? slot : null;
}

export function isWeaponSlotId(slotId: string): slotId is WeaponEditorSlotId {
  return slotId in weaponSlotLabels;
}
