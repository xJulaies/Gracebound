import type {
  PhysicalAttackType,
  WeaponAttackProfile,
} from "../../../features/weapons/domain/weaponAttack.types";
import type { WeaponParamRow } from "../schemas/weaponParam.schema";
import type {
  AttackParamRow,
  BehaviorParamRow,
} from "../schemas/weaponAttackParam.schema";

export interface RegulationWeaponAttackDefinition {
  id: string;
  name: string;
  behaviorVariationId: number;
  behaviorJudgeId: number;
}

export function mapRegulationWeaponAttacks(
  weapon: WeaponParamRow,
  definitions: readonly RegulationWeaponAttackDefinition[],
  behaviorRows: BehaviorParamRow[],
  attackRows: AttackParamRow[],
): WeaponAttackProfile[] {
  return definitions.map((definition) => {
    const matchingBehaviors = behaviorRows.filter(
      (row) =>
        row.variationId === definition.behaviorVariationId &&
        row.behaviorJudgeId === definition.behaviorJudgeId &&
        row.refType === 0,
    );

    if (matchingBehaviors.length !== 1) {
      throw new Error(
        `Expected one direct attack behavior ${definition.behaviorVariationId}:${definition.behaviorJudgeId}, found ${matchingBehaviors.length}`,
      );
    }
    const behavior = matchingBehaviors[0]!;

    const matchingAttacks = attackRows.filter((row) => row.ID === behavior.refId);

    if (matchingAttacks.length !== 1) {
      throw new Error(
        `Expected one AtkParam_Pc ${behavior.refId}, found ${matchingAttacks.length}`,
      );
    }
    const attack = matchingAttacks[0]!;

    if (attack.isAddBaseAtk !== 0) {
      throw new Error(`Unsupported additive attack ${attack.ID}`);
    }

    return {
      ...definition,
      sourceBehaviorId: behavior.ID,
      sourceAttackId: attack.ID,
      motionValues: {
        physical: attack.atkPhysCorrection,
        magic: attack.atkMagCorrection,
        fire: attack.atkFireCorrection,
        lightning: attack.atkThunCorrection,
        holy: attack.atkDarkCorrection,
      },
      physicalAttackType: resolvePhysicalAttackType(attack.atkAttribute, weapon),
    };
  });
}

export function resolvePhysicalAttackType(
  attackAttribute: number,
  weapon: WeaponParamRow,
): PhysicalAttackType {
  const resolvedAttribute = attackAttribute === 253
    ? weapon.atkAttribute
    : attackAttribute === 252
      ? weapon.atkAttribute2
      : attackAttribute;

  const attackTypes: Record<number, PhysicalAttackType> = {
    0: "standard",
    1: "strike",
    2: "slash",
    3: "pierce",
  };
  const attackType = attackTypes[resolvedAttribute];

  if (!attackType) {
    throw new Error(`Unsupported physical attack attribute ${attackAttribute}`);
  }

  return attackType;
}
