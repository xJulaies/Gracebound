import type { DamageTypes } from "../../damage/domain/damage.types";

export interface PhysicalAbsorption {
  standard: number;
  slash: number;
  strike: number;
  pierce: number;
}

export interface BossAbsorption {
  physical: PhysicalAbsorption;
  magic: number;
  fire: number;
  lightning: number;
  holy: number;
}

export interface BossData {
  id: string;
  name: string;
  health: number;
  defense: DamageTypes;
  absorption: BossAbsorption;
  sourceNpcId: number;
  healthScalingEffectId: number;
}
