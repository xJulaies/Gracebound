import type { CharacterStats } from "../../builds/domain/buildStats.types";
import type { DamageTypes } from "../../damage/domain/damage.types";

export interface CrystalTearEffects {
  durationSeconds: number;
  attributeBonuses: CharacterStats;
  resourceMultipliers: { maxHp: number; maxStamina: number; maxEquipLoad: number };
  outgoingDamageMultipliers: DamageTypes;
  chargedAttackDamageMultipliers: DamageTypes;
  incomingDamageMultipliers: DamageTypes;
  fpCostMultipliers: { skill: number; sorcery: number; incantation: number };
  poiseDamageMultiplier: number;
  staminaRecoverySpeedBonus: number;
  statusResistanceBonuses: { poison: number; rot: number; bleed: number; frost: number; sleep: number; madness: number; deathBlight: number };
  cleansesStatusBuildup: Array<"poison" | "rot" | "bleed" | "frost" | "sleep" | "madness" | "deathBlight">;
  recovery: {
    instantMaxHpPercent: number;
    instantMaxFpPercent: number;
    hpPerSecond: number;
    hpRegenerationDurationSeconds: number;
  };
}

import type { ItemText } from "../../../shared/domain/itemText.types";

export interface CrystalTearData extends ItemText {
  id: string;
  sourceGoodsId: number;
  sourceEffectId: number;
  name: string;
  iconId: number;
  calculationStatus: "supported" | "catalog-only";
  effects: CrystalTearEffects | null;
  limitations: string[];
}
