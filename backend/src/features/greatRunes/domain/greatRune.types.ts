import type { CharacterStats } from "../../builds/domain/buildStats.types";
import type { ItemText } from "../../../shared/domain/itemText.types";

export interface GreatRuneEffects {
  attributeBonuses: CharacterStats;
  resourceMultipliers: {
    maxHp: number;
    maxFp: number;
    maxStamina: number;
  };
}

export interface GreatRuneData extends ItemText {
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
