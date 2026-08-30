import type { TalismanEffects } from "../../talismans/domain/talisman.types";

export interface CharacterStats {
  vigor: number;
  mind: number;
  endurance: number;
  strength: number;
  dexterity: number;
  intelligence: number;
  faith: number;
  arcane: number;
}

export type BuildStatTalismanEffects = Pick<
  TalismanEffects,
  | "attributeBonuses"
  | "resourceMultipliers"
  | "statusResistanceBonuses"
  | "incomingDamageMultipliers"
  | "utilityEffects"
>;
