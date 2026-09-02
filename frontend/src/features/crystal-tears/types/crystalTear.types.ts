import type { CalculationStatus, CharacterStats, DamageTypes } from "../../../shared/types/game.types";

type Status = "poison" | "rot" | "bleed" | "frost" | "sleep" | "madness" | "deathBlight";

export interface CrystalTear {
  id: string;
  name: string;
  iconId: number;
  iconUrl: string;
  calculationStatus: CalculationStatus;
  effects: {
    durationSeconds: number;
    attributeBonuses: CharacterStats;
    resourceMultipliers: { maxHp: number; maxStamina: number; maxEquipLoad: number };
    outgoingDamageMultipliers: DamageTypes;
    chargedAttackDamageMultipliers: DamageTypes;
    incomingDamageMultipliers: DamageTypes;
    fpCostMultipliers: { skill: number; sorcery: number; incantation: number };
    poiseDamageMultiplier: number;
    staminaRecoverySpeedBonus: number;
    statusResistanceBonuses: Record<Status, number>;
    cleansesStatusBuildup: Status[];
    recovery: {
      instantMaxHpPercent: number;
      instantMaxFpPercent: number;
      hpPerSecond: number;
      hpRegenerationDurationSeconds: number;
    };
  } | null;
  limitations: string[];
  gameVersion: string;
}
