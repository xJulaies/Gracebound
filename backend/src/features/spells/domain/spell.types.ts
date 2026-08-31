import type { DamageTypes } from "../../damage/domain/damage.types";

export type SpellType = "sorcery" | "incantation";

export interface SpellAttackProfile {
  sourceBulletId: number;
  sourceAttackId: number;
  motionValues: DamageTypes;
  finalDamageRates: DamageTypes;
}

export interface SpellData {
  id: string;
  sourceMagicId: number;
  name: string;
  type: SpellType;
  fpCost: number;
  slotsRequired: number;
  requirements: {
    intelligence: number;
    faith: number;
    arcane: number;
  };
  iconId: number;
  calculationStatus: "catalog-only" | "supported";
  attack: SpellAttackProfile | null;
}
