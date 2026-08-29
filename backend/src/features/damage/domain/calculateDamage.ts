import type { BossAbsorption } from "../../bosses/domain/boss.types";
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

export interface HitDamageTarget {
  id: string;
  name: string;
  defense: DamageTypes;
  absorption: BossAbsorption;
}

export interface HitDamageInput {
  attackRating: DamageTypes;
  motionValue: number;
  physicalAttackType: "standard" | "slash" | "strike" | "pierce";
  target?: HitDamageTarget;
}

export function calculateHitDamage(input: HitDamageInput) {
  const motionMultiplier = input.motionValue / 100;
  const offensiveOutput = mapDamageTypes(
    input.attackRating,
    (attackRating) => Math.floor(attackRating * motionMultiplier),
  );

  const commonResult = {
    attackRating: withTotal(input.attackRating),
    motionValue: input.motionValue,
    physicalAttackType: input.physicalAttackType,
    offensiveOutput: withTotal(offensiveOutput),
    accuracy: "estimated" as const,
    limitations: [
      "Attack rating must currently be supplied by the client.",
      "Buffs, status effects, and special mechanics are not included.",
    ],
  };

  if (!input.target) {
    return commonResult;
  }

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
    ...commonResult,
    target: { id: input.target.id, name: input.target.name },
    damage: {
      ...damage,
      total: sumDamageTypes(damage),
    },
  };
}

function mapDamageTypes(
  damage: DamageTypes,
  mapValue: (value: number) => number,
): DamageTypes {
  return {
    physical: mapValue(damage.physical),
    magic: mapValue(damage.magic),
    fire: mapValue(damage.fire),
    lightning: mapValue(damage.lightning),
    holy: mapValue(damage.holy),
  };
}

function withTotal(damage: DamageTypes) {
  return { ...damage, total: sumDamageTypes(damage) };
}

function sumDamageTypes(damage: DamageTypes): number {
  return DAMAGE_TYPES.reduce((total, type) => total + damage[type], 0);
}
