import type { ItemText } from "../../../shared/domain/itemText.types";

export interface TalismanData extends ItemText {
  id: string;
  sourceAccessoryId: number;
  name: string;
  iconId: number;
  weight: number;
  sourceEffectId: number;
  calculationStatus: "catalog-only" | "supported";
  effects: TalismanEffects | null;
}

export interface TalismanEffects {
  resourceMultipliers: {
    maxHp: number;
    maxFp: number;
    maxStamina: number;
    maxEquipLoad: number;
  };
  statusResistanceBonuses: {
    poison: number;
    rot: number;
    bleed: number;
    frost: number;
    sleep: number;
    madness: number;
    deathBlight: number;
  };
  spellDamageMultipliers: {
    sorcery: number;
    incantation: number;
  };
  utilityEffects: {
    itemDiscoveryRateBonus: number;
    runeAcquisitionMultiplier: number;
    memorySlotBonus: number;
    staminaRecoverySpeedBonus: number;
    poiseDamageMultiplier: number;
    skillFpCostMultiplier: number;
    spellFpCostMultiplier: number;
    spellEffectDurationMultiplier: number;
    castingSpeedVirtualDexterity: number;
  };
  recoveryEffects: {
    hpFlaskRecoveryMultiplier: number;
    fpFlaskRecoveryMultiplier: number;
    hpRecoveryPerSecond: number;
  };
  guardEffects: {
    staminaDamageMultiplier: number;
    staminaCostMultiplier: number;
  };
  conditionalAttackDamageMultipliers: {
    counterattack: DamageTypeMultipliers;
    critical: DamageTypeMultipliers;
    finalChainAttack: DamageTypeMultipliers;
    mounted: DamageTypeMultipliers;
    jumping: DamageTypeMultipliers;
    guardCounter: DamageTypeMultipliers;
  };
  hpConditionedDamageEffect: {
    activation: "low-hp" | "full-hp" | null;
    thresholdPercent: number | null;
    outgoingDamageMultipliers: DamageTypeMultipliers;
    incomingDamageMultipliers: DamageTypeMultipliers;
  };
  specializedAttackEffects: {
    projectileRangeBonus: number;
    rangedDamageMultipliers: DamageTypeMultipliers;
    roarAndBreathDamageMultipliers: DamageTypeMultipliers;
    chargedSpellAndSkillDamageMultipliers: DamageTypeMultipliers;
    throwablePotDamageMultipliers: DamageTypeMultipliers;
    perfumeDamageMultipliers: DamageTypeMultipliers;
  };
  successiveAttackEffect: {
    stages: Array<{
      accumulatorThreshold: number;
      durationSeconds: number;
      damageMultipliers: DamageTypeMultipliers;
    }>;
  };
  triggeredDamageEffect: {
    trigger: "blood-loss-nearby" | "poison-or-rot-nearby" | null;
    durationSeconds: number;
    damageMultipliers: DamageTypeMultipliers;
  };
  eventRecoveryEffect: {
    trigger: "enemy-kill" | "critical-hit" | "successive-attacks" | null;
    accumulatorThreshold: number | null;
    maxHpRecoveryPercent: number;
    flatHpRecovery: number;
    flatFpRecovery: number;
  };
  miscellaneousEffects: {
    silentMovement: boolean;
    fallDamageMultiplier: number;
    enemyTargetPriorityModifier: number;
    preventsRuneLoss: boolean;
    appearance: "host" | "cooperator" | null;
  };
  specialDefenseEffects: {
    criticalDamageMultipliers: DamageTypeMultipliers;
    dodgeEffectRefreshSeconds: number;
    dodgeEffectDurationSeconds: number;
    reducesHeadshotImpact: boolean;
    concealsAtDistanceWhileCrouching: boolean;
  };
  attributeBonuses: {
    vigor: number;
    mind: number;
    endurance: number;
    strength: number;
    dexterity: number;
    intelligence: number;
    faith: number;
    arcane: number;
  };
  incomingDamageMultipliers: {
    physical: number;
    magic: number;
    fire: number;
    lightning: number;
    holy: number;
  };
  outgoingDamageMultipliers: {
    physical: number;
    magic: number;
    fire: number;
    lightning: number;
    holy: number;
  };
  skillDamageMultipliers: {
    physical: number;
    magic: number;
    fire: number;
    lightning: number;
    holy: number;
  };
  chargedAttackDamageMultipliers: {
    physical: number;
    magic: number;
    fire: number;
    lightning: number;
    holy: number;
  };
}

export interface DamageTypeMultipliers {
  physical: number;
  magic: number;
  fire: number;
  lightning: number;
  holy: number;
}
