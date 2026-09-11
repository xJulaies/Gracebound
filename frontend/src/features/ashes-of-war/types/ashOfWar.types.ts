import type {
  DamageTypes,
  StatusResistances,
} from "../../../shared/types/game.types";

export interface AshOfWar {
  id: string;
  name: string;
  summary: string | null;
  description: string | null;
  iconId: number;
  iconUrl: string;
  compatibleWeaponTypes: string[];
  compatibleAffinities: string[];
  calculationStatus: "supported" | "catalog-only";
  buffEffect: {
    durationSeconds: number;
    consumption: "duration" | "next-hit";
    attackPowerMultipliers: DamageTypes;
    outgoingDamageMultipliers: DamageTypes;
    addedDamage: DamageTypes;
    addedStatusBuildup: StatusResistances;
    poiseDamageMultiplier: number;
    limitations: string[];
  } | null;
  attacks: Array<{ id: string; name: string; fpCost: number }>;
  gameVersion: string;
}
