import type { DamageTypes } from "../../damage/domain/damage.types";

export const ATTRIBUTE_NAMES = [
  "strength",
  "dexterity",
  "intelligence",
  "faith",
  "arcane",
] as const;

export type AttributeName = (typeof ATTRIBUTE_NAMES)[number];
export type Attributes = Record<AttributeName, number>;

export interface ScalingCurve {
  id: string;
  values: number[];
}

export interface ReinforcementLevel {
  level: number;
  attackMultiplier: DamageTypes;
  scalingMultiplier: Attributes;
}

export interface AttributeCorrection {
  attribute: AttributeName;
  curveId: string;
  influenceRatio: number;
  scalingOverride?: number;
}

export interface WeaponCalculationData {
  id: string;
  sourceId: number;
  name: string;
  gameVersion: string;
  maxUpgradeLevel: number;
  reinforcementId: string;
  requirements: Attributes;
  baseAttack: DamageTypes;
  baseScaling: Attributes;
  corrections: Record<keyof DamageTypes, AttributeCorrection[]>;
}

export interface WeaponDataSet {
  weapons: Record<string, WeaponCalculationData>;
  reinforcements: Record<string, ReinforcementLevel[]>;
  scalingCurves: Record<string, ScalingCurve>;
}
