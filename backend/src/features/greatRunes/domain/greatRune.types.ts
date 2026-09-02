import type { CharacterStats } from "../../builds/domain/buildStats.types";

export interface GreatRuneEffects {
  attributeBonuses: CharacterStats;
  resourceMultipliers: {
    maxHp: number;
    maxFp: number;
    maxStamina: number;
  };
}

export interface GreatRuneData {
  id: string;
  sourceGoodsId: number;
  sourceEffectId: number | null;
  name: string;
  iconId: number;
  activation: "rune-arc" | "not-applicable";
  calculationStatus: "supported" | "catalog-only";
  effects: GreatRuneEffects | null;
  limitations: string[];
}
