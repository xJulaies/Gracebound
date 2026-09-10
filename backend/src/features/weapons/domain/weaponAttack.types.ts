import type { DamageTypes } from "../../damage/domain/damage.types";

export type PhysicalAttackType = "standard" | "strike" | "slash" | "pierce";

export const WEAPON_ATTACK_TRAITS = ["charged", "jumping"] as const;

export type WeaponAttackTrait = (typeof WEAPON_ATTACK_TRAITS)[number];

export interface WeaponAttackProfile {
  id: string;
  name: string;
  traits: WeaponAttackTrait[];
  behaviorVariationId: number;
  behaviorJudgeId: number;
  sourceBehaviorId: number;
  sourceAttackId: number;
  motionValues: DamageTypes;
  physicalAttackType: PhysicalAttackType;
}
