export type ArmorSlot = "head" | "body" | "arms" | "legs";

import type { ItemText } from "../../../shared/domain/itemText.types";

export interface ArmorData extends ItemText {
  id: string;
  sourceProtectorId: number;
  name: string;
  slot: ArmorSlot;
  iconId: number;
  weight: number;
  poise: number;
  damageNegation: {
    physical: number;
    strike: number;
    slash: number;
    pierce: number;
    magic: number;
    fire: number;
    lightning: number;
    holy: number;
  };
  resistances: {
    poison: number;
    rot: number;
    bleed: number;
    frost: number;
    sleep: number;
    madness: number;
    deathBlight: number;
  };
  sourceEffectIds: number[];
  hasUnresolvedPassiveEffects: boolean;
  passiveEffects: ArmorPassiveEffects;
}

export interface ArmorPassiveEffects {
  attributeBonuses: {
    vigor: number; mind: number; endurance: number; strength: number;
    dexterity: number; intelligence: number; faith: number; arcane: number;
  };
  resourceMultipliers: { maxHp: number; maxFp: number; maxStamina: number; maxEquipLoad: number };
  fpCostMultipliers: { skill: number; sorcery: number; incantation: number };
  incomingDamageMultipliers: { physical: number; magic: number; fire: number; lightning: number; holy: number };
  statusResistanceBonuses: {
    poison: number; rot: number; bleed: number; frost: number;
    sleep: number; madness: number; deathBlight: number;
  };
  flaskRecoveryMultipliers: { hp: number; fp: number };
  conditionalAttackBoosts: ArmorConditionalAttackBoost[];
  regenerationEffects: ArmorRegenerationEffect[];
  utilityEffects: {
    enemyHearingMultiplier: number;
    aggroPriorityModifier: number;
    dodgeContactPhysicalDamage: number;
    reducesHeadshotImpact: boolean;
  };
  scopedDamageBoosts: ArmorScopedDamageBoost[];
}

export interface ArmorConditionalAttackBoost {
  trigger: "blood-loss-nearby" | "poison-or-rot-nearby" | "madness-on-wearer";
  durationSeconds: number;
  outgoingDamageMultipliers: { physical: number; magic: number; fire: number; lightning: number; holy: number };
}

export interface ArmorRegenerationEffect {
  target: "wearer" | "nearby-allies";
  hpPerSecond: number;
  maximumHpPercent: number | null;
  radius: number | null;
}

export interface ArmorScopedDamageBoost {
  scope:
    | "thorn-sorceries" | "glintstone-weapon-skills" | "ancestral-infant"
    | "noble-presence" | "crucible-incantations" | "glintstone-stars-sorceries"
    | "stars-of-ruin" | "comet-sorceries" | "comet-azur" | "envoy-bubble-skills"
    | "omen-bairn-tools" | "cold-sorceries" | "golden-order-incantations"
    | "throwable-pots" | "jumping-attacks" | "all-physical-attacks";
  damageMultipliers: { physical: number; magic: number; fire: number; lightning: number; holy: number };
}

export function neutralArmorPassiveEffects(): ArmorPassiveEffects {
  return {
    attributeBonuses: { vigor: 0, mind: 0, endurance: 0, strength: 0, dexterity: 0, intelligence: 0, faith: 0, arcane: 0 },
    resourceMultipliers: { maxHp: 1, maxFp: 1, maxStamina: 1, maxEquipLoad: 1 },
    fpCostMultipliers: { skill: 1, sorcery: 1, incantation: 1 },
    incomingDamageMultipliers: { physical: 1, magic: 1, fire: 1, lightning: 1, holy: 1 },
    statusResistanceBonuses: { poison: 0, rot: 0, bleed: 0, frost: 0, sleep: 0, madness: 0, deathBlight: 0 },
    flaskRecoveryMultipliers: { hp: 1, fp: 1 },
    conditionalAttackBoosts: [],
    regenerationEffects: [],
    utilityEffects: { enemyHearingMultiplier: 1, aggroPriorityModifier: 0, dodgeContactPhysicalDamage: 0, reducesHeadshotImpact: false },
    scopedDamageBoosts: [],
  };
}
