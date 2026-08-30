import type { BossAbsorption } from "../../bosses/domain/boss.types";
import type { WeaponSkillAttack } from "../../weapons/domain/weaponSkill.types";
import type { DamageTypes } from "./damage.types";
import {
  calculateDamageAfterAbsorption,
  calculateDefenseMultiplier,
} from "./calculateDamage";

const DAMAGE_TYPES = [
  "physical",
  "magic",
  "fire",
  "lightning",
  "holy",
] as const satisfies readonly (keyof DamageTypes)[];

export interface DamageTarget {
  id: string;
  name: string;
  defense: DamageTypes;
  absorption: BossAbsorption;
}

export function calculateAttackOutput(
  attackRating: DamageTypes,
  attack: WeaponSkillAttack,
  target?: DamageTarget,
  outgoingDamageMultipliers: DamageTypes = unitDamageTypes(),
) {
  const components = attack.components.map((component) => {
    const rawOffensiveOutput = mapDamageTypes((damageType) =>
      (attackRating[damageType] * component.motionValues[damageType] / 100 +
        component.addedDamage[damageType]) *
      component.finalDamageRates[damageType] *
      outgoingDamageMultipliers[damageType],
    );
    const offensiveOutput = withTotal(floorDamageTypes(rawOffensiveOutput));

    if (!target) {
      return {
        kind: component.kind,
        sourceAttackId: component.sourceAttackId,
        offensiveOutput,
      };
    }

    const damage = mapDamageTypes((damageType) => {
      const incomingDamage = rawOffensiveOutput[damageType];
      const afterDefense =
        incomingDamage *
        calculateDefenseMultiplier(incomingDamage, target.defense[damageType]);
      const absorption = damageType === "physical"
        ? target.absorption.physical[component.physicalAttackType]
        : target.absorption[damageType];

      return Math.floor(
        calculateDamageAfterAbsorption(afterDefense, absorption),
      );
    });

    return {
      kind: component.kind,
      sourceAttackId: component.sourceAttackId,
      offensiveOutput,
      damage: withTotal(damage),
    };
  });

  const offensiveOutput = sumComponentValues(
    components.map((component) => component.offensiveOutput),
  );
  const damage = target
    ? sumComponentValues(
        components.map((component) => {
          if (!("damage" in component)) {
            throw new Error("Missing target damage component");
          }
          return component.damage!;
        }),
      )
    : undefined;

  return {
    attack: {
      id: attack.id,
      name: attack.name,
      fpCost: attack.fpCost,
    },
    attackRating: withTotal(attackRating),
    components,
    offensiveOutput,
    ...(target ? { target: { id: target.id, name: target.name }, damage } : {}),
    accuracy: "estimated" as const,
  };
}

function unitDamageTypes(): DamageTypes {
  return { physical: 1, magic: 1, fire: 1, lightning: 1, holy: 1 };
}

function mapDamageTypes(
  calculate: (damageType: keyof DamageTypes) => number,
): DamageTypes {
  return {
    physical: calculate("physical"),
    magic: calculate("magic"),
    fire: calculate("fire"),
    lightning: calculate("lightning"),
    holy: calculate("holy"),
  };
}

function floorDamageTypes(damage: DamageTypes): DamageTypes {
  return mapDamageTypes((damageType) => Math.floor(damage[damageType]));
}

function withTotal(damage: DamageTypes) {
  return {
    ...damage,
    total: DAMAGE_TYPES.reduce((total, damageType) => total + damage[damageType], 0),
  };
}

function sumComponentValues(values: Array<DamageTypes & { total: number }>) {
  return withTotal(
    mapDamageTypes((damageType) =>
      values.reduce((total, value) => total + value[damageType], 0),
    ),
  );
}
