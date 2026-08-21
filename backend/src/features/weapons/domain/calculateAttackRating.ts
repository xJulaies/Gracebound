import type { DamageTypes } from "../../damage/domain/damage.types";
import {
  type AttributeCorrection,
  type Attributes,
  type ScalingCurve,
  type WeaponCalculationData,
  type WeaponDataSet,
} from "./weapon.types";

const DAMAGE_TYPES = [
  "physical",
  "magic",
  "fire",
  "lightning",
  "holy",
] as const satisfies readonly (keyof DamageTypes)[];

export function calculateScalingCorrection(
  attributeValue: number,
  curve: ScalingCurve,
): number {
  const correction = curve.values[attributeValue];

  if (correction === undefined) {
    throw new Error(
      `Scaling curve ${curve.id} has no value for ${attributeValue}`,
    );
  }

  return correction;
}

export function calculateAttackRating(
  weapon: WeaponCalculationData,
  upgradeLevel: number,
  attributes: Attributes,
  dataSet: WeaponDataSet,
): DamageTypes {
  const reinforcement = dataSet.reinforcements[
    weapon.reinforcementId
  ]?.find((entry) => entry.level === upgradeLevel);

  if (!reinforcement || upgradeLevel > weapon.maxUpgradeLevel) {
    throw new Error(`Invalid upgrade level for ${weapon.name}`);
  }

  const attackRating = {} as DamageTypes;

  for (const damageType of DAMAGE_TYPES) {
    const baseAttack =
      weapon.baseAttack[damageType] *
      reinforcement.attackMultiplier[damageType];
    const scaling = weapon.corrections[damageType].map((correction) =>
      calculateAttributeScaling(
        correction,
        weapon,
        attributes,
        reinforcement.scalingMultiplier[correction.attribute],
        dataSet,
      ),
    );
    const requirementPenalty = Math.min(0, ...scaling);
    const scalingMultiplier = Math.max(
      requirementPenalty,
      scaling.reduce((total, value) => total + value, 0),
    );

    attackRating[damageType] = Math.floor(
      baseAttack + baseAttack * scalingMultiplier,
    );
  }

  return attackRating;
}

function calculateAttributeScaling(
  correction: AttributeCorrection,
  weapon: WeaponCalculationData,
  attributes: Attributes,
  reinforcementScaling: number,
  dataSet: WeaponDataSet,
): number {
  const attributeValue = attributes[correction.attribute];
  const requirement = weapon.requirements[correction.attribute];

  if (attributeValue < requirement) {
    return 0.6 * (correction.influenceRatio - 1) - 0.4;
  }

  const curve = dataSet.scalingCurves[correction.curveId];

  if (!curve) {
    throw new Error(`Unknown scaling curve ${correction.curveId}`);
  }

  const baseScaling =
    correction.scalingOverride ??
    weapon.baseScaling[correction.attribute];

  return (
    correction.influenceRatio -
    1 +
    baseScaling *
      reinforcementScaling *
      calculateScalingCorrection(attributeValue, curve) *
      correction.influenceRatio
  );
}
