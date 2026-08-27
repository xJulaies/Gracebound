import type { DamageTypes } from "../../damage/domain/damage.types";

export type PhysicalAttackType = "standard" | "strike" | "slash" | "pierce";

export interface WeaponAttackProfile {
  id: string;
  name: string;
  behaviorVariationId: number;
  behaviorJudgeId: number;
  sourceBehaviorId: number;
  sourceAttackId: number;
  motionValues: DamageTypes;
  physicalAttackType: PhysicalAttackType;
}
