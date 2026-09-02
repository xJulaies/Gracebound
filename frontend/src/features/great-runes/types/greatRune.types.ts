import type { CalculationStatus, CharacterStats } from "../../../shared/types/game.types";

export interface GreatRune {
  id: string;
  name: string;
  iconId: number;
  iconUrl: string;
  activation: "rune-arc" | "not-applicable";
  calculationStatus: CalculationStatus;
  effects: {
    attributeBonuses: CharacterStats;
    resourceMultipliers: { maxHp: number; maxFp: number; maxStamina: number };
  } | null;
  limitations: string[];
  gameVersion: string;
}
