import { neutralArmorPassiveEffects, type ArmorData } from "../../armor/domain/armor.types";

type DamageNegation = ArmorData["damageNegation"];
type IncomingDamageMultipliers = Pick<
  ArmorData["passiveEffects"]["incomingDamageMultipliers"],
  "physical" | "magic" | "fire" | "lightning" | "holy"
>;

export function calculateArmorStats(armor: ArmorData[]) {
  const slots = new Set(armor.map(({ slot }) => slot));
  if (slots.size !== armor.length) throw new Error("Only one armor piece per slot is allowed");

  return {
    equipmentWeight: round(armor.reduce((total, item) => total + item.weight, 0)),
    poise: round(armor.reduce((total, item) => total + item.poise, 0)),
    damageNegation: combineDamageNegation(armor),
    resistanceBonuses: armor.reduce((total, item) => ({
      poison: total.poison + item.resistances.poison,
      rot: total.rot + item.resistances.rot,
      bleed: total.bleed + item.resistances.bleed,
      frost: total.frost + item.resistances.frost,
      sleep: total.sleep + item.resistances.sleep,
      madness: total.madness + item.resistances.madness,
      deathBlight: total.deathBlight + item.resistances.deathBlight,
    }), { poison: 0, rot: 0, bleed: 0, frost: 0, sleep: 0, madness: 0, deathBlight: 0 }),
    passiveEffects: combinePassiveEffects(armor),
    hasUnresolvedPassiveEffects: armor.some(({ hasUnresolvedPassiveEffects }) => hasUnresolvedPassiveEffects),
  };
}

export function applyIncomingDamageMultipliers(
  armorNegation: DamageNegation,
  incomingDamageMultipliers: IncomingDamageMultipliers,
): DamageNegation {
  const multiplierFor = (damageType: keyof DamageNegation) =>
    incomingDamageMultipliers[
      damageType === "strike" || damageType === "slash" || damageType === "pierce"
        ? "physical"
        : damageType
    ];

  return mapValues(armorNegation, (damageType, negation) =>
    round(1 - (1 - negation) * multiplierFor(damageType)),
  );
}

function combinePassiveEffects(armor: ArmorData[]) {
  return armor.reduce((total, item) => ({
    attributeBonuses: mapValues(total.attributeBonuses, (key, value) => value + item.passiveEffects.attributeBonuses[key]),
    resourceMultipliers: mapValues(total.resourceMultipliers, (key, value) => round(value * item.passiveEffects.resourceMultipliers[key])),
    fpCostMultipliers: mapValues(total.fpCostMultipliers, (key, value) => round(value * item.passiveEffects.fpCostMultipliers[key])),
    incomingDamageMultipliers: mapValues(total.incomingDamageMultipliers, (key, value) => round(value * item.passiveEffects.incomingDamageMultipliers[key])),
    statusResistanceBonuses: mapValues(total.statusResistanceBonuses, (key, value) => value + item.passiveEffects.statusResistanceBonuses[key]),
    flaskRecoveryMultipliers: mapValues(total.flaskRecoveryMultipliers, (key, value) => round(value * item.passiveEffects.flaskRecoveryMultipliers[key])),
    conditionalAttackBoosts: [...total.conditionalAttackBoosts, ...item.passiveEffects.conditionalAttackBoosts],
    regenerationEffects: [...total.regenerationEffects, ...item.passiveEffects.regenerationEffects],
    utilityEffects: {
      enemyHearingMultiplier: round(total.utilityEffects.enemyHearingMultiplier * item.passiveEffects.utilityEffects.enemyHearingMultiplier),
      aggroPriorityModifier: round(total.utilityEffects.aggroPriorityModifier + item.passiveEffects.utilityEffects.aggroPriorityModifier),
      dodgeContactPhysicalDamage: round(total.utilityEffects.dodgeContactPhysicalDamage + item.passiveEffects.utilityEffects.dodgeContactPhysicalDamage),
      reducesHeadshotImpact: total.utilityEffects.reducesHeadshotImpact || item.passiveEffects.utilityEffects.reducesHeadshotImpact,
    },
    scopedDamageBoosts: [...total.scopedDamageBoosts, ...item.passiveEffects.scopedDamageBoosts],
  }), neutralArmorPassiveEffects());
}

function mapValues<T extends Record<string, number>>(values: T, map: (key: keyof T, value: number) => number): T {
  return Object.fromEntries(
    (Object.keys(values) as Array<keyof T>).map((key) => [key, map(key, values[key])]),
  ) as T;
}

function combineDamageNegation(armor: ArmorData[]) {
  const keys = ["physical", "strike", "slash", "pierce", "magic", "fire", "lightning", "holy"] as const;
  return Object.fromEntries(keys.map((key) => [
    key,
    round(1 - armor.reduce((multiplier, item) => multiplier * (1 - item.damageNegation[key]), 1)),
  ])) as Record<typeof keys[number], number>;
}

function round(value: number) {
  return Number(value.toFixed(6));
}
