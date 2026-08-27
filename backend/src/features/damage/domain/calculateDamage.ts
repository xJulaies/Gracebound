import type { ManualDamageInput } from "../schemas/damage.schema";
import type { DamageTypes } from "./damage.types";

const DAMAGE_TYPES = [
  "physical",
  "magic",
  "fire",
  "lightning",
  "holy",
] as const satisfies readonly (keyof DamageTypes)[];

export function calculateDefenseMultiplier(
  incomingDamage: number,
  defense: number,
): number {
  if (incomingDamage === 0) {
    return 0;
  }

  if (defense === 0) {
    return 0.9;
  }

  const ratio = incomingDamage / defense;

  if (ratio < 0.125) {
    return 0.1;
  }

  if (ratio < 1) {
    return (19.2 / 49) * (ratio - 0.125) ** 2 + 0.1;
  }

  if (ratio < 2.5) {
    return (-0.4 / 3) * (ratio - 2.5) ** 2 + 0.7;
  }

  if (ratio < 8) {
    return (-0.8 / 121) * (ratio - 8) ** 2 + 0.9;
  }

  return 0.9;
}

export function calculateDamageAfterAbsorption(
  damage: number,
  absorption: number,
): number {
  return damage * (1 - absorption / 100);
}

export function calculateHitDamage(input: ManualDamageInput) {
  const motionMultiplier = input.motionValue / 100;
  const damage = {} as DamageTypes;

  for (const damageType of DAMAGE_TYPES) {
    const incomingDamage = input.attackRating[damageType] * motionMultiplier;
    const afterDefense =
      incomingDamage *
      calculateDefenseMultiplier(incomingDamage, input.target.defense[damageType]);
    const absorption = damageType === "physical"
      ? input.target.absorption.physical[input.physicalAttackType]
      : input.target.absorption[damageType];
    const afterAbsorption = calculateDamageAfterAbsorption(
      afterDefense,
      absorption,
    );

    damage[damageType] = Math.floor(afterAbsorption);
  }

  return {
    attackRating: {
      ...input.attackRating,
      total: sumDamageTypes(input.attackRating),
    },
    motionValue: input.motionValue,
    physicalAttackType: input.physicalAttackType,
    target: input.target,
    damage: {
      ...damage,
      total: sumDamageTypes(damage),
    },
    accuracy: "estimated" as const,
    limitations: [
      "Attack rating must currently be supplied by the client.",
      "Weapon attacks, buffs, status effects, and special mechanics are not included.",
    ],
  };
}

function sumDamageTypes(damage: DamageTypes): number {
  return DAMAGE_TYPES.reduce((total, type) => total + damage[type], 0);
}
