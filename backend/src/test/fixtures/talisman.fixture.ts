import type {
  TalismanData,
  TalismanEffects,
} from "../../features/talismans/domain/talisman.types";

export function createTalismanFixture(
  id: string,
  name: string,
  overrides: {
    attributeBonuses?: Partial<TalismanEffects["attributeBonuses"]>;
    resourceMultipliers?: Partial<TalismanEffects["resourceMultipliers"]>;
    statusResistanceBonuses?: Partial<TalismanEffects["statusResistanceBonuses"]>;
    incomingDamageMultipliers?: Partial<TalismanEffects["incomingDamageMultipliers"]>;
    utilityEffects?: Partial<TalismanEffects["utilityEffects"]>;
    spellDamageMultipliers?: Partial<TalismanEffects["spellDamageMultipliers"]>;
    outgoingDamageMultipliers?: Partial<TalismanEffects["outgoingDamageMultipliers"]>;
    specializedAttackEffects?: Partial<TalismanEffects["specializedAttackEffects"]>;
  } = {},
): TalismanData {
  const effects = neutralTalismanEffects();
  return {
    id,
    sourceAccessoryId: 1000,
    name,
    iconId: 18000,
    weight: 0.8,
    sourceEffectId: 310000,
    calculationStatus: "supported",
    effects: {
      ...effects,
      attributeBonuses: { ...effects.attributeBonuses, ...overrides.attributeBonuses },
      resourceMultipliers: { ...effects.resourceMultipliers, ...overrides.resourceMultipliers },
      statusResistanceBonuses: {
        ...effects.statusResistanceBonuses,
        ...overrides.statusResistanceBonuses,
      },
      incomingDamageMultipliers: {
        ...effects.incomingDamageMultipliers,
        ...overrides.incomingDamageMultipliers,
      },
      utilityEffects: { ...effects.utilityEffects, ...overrides.utilityEffects },
      spellDamageMultipliers: {
        ...effects.spellDamageMultipliers,
        ...overrides.spellDamageMultipliers,
      },
      outgoingDamageMultipliers: {
        ...effects.outgoingDamageMultipliers,
        ...overrides.outgoingDamageMultipliers,
      },
      specializedAttackEffects: {
        ...effects.specializedAttackEffects,
        ...overrides.specializedAttackEffects,
      },
    },
  };
}

function neutralTalismanEffects(): TalismanEffects {
  const damageTypes = () => ({ physical: 1, magic: 1, fire: 1, lightning: 1, holy: 1 });
  return {
    resourceMultipliers: { maxHp: 1, maxFp: 1, maxStamina: 1, maxEquipLoad: 1 },
    statusResistanceBonuses: {
      poison: 0, rot: 0, bleed: 0, frost: 0, sleep: 0, madness: 0, deathBlight: 0,
    },
    spellDamageMultipliers: { sorcery: 1, incantation: 1 },
    utilityEffects: {
      itemDiscoveryRateBonus: 0, runeAcquisitionMultiplier: 1, memorySlotBonus: 0,
      staminaRecoverySpeedBonus: 0, poiseDamageMultiplier: 1, skillFpCostMultiplier: 1,
      spellFpCostMultiplier: 1, spellEffectDurationMultiplier: 1,
      castingSpeedVirtualDexterity: 0,
    },
    recoveryEffects: {
      hpFlaskRecoveryMultiplier: 1, fpFlaskRecoveryMultiplier: 1, hpRecoveryPerSecond: 0,
    },
    guardEffects: { staminaDamageMultiplier: 1, staminaCostMultiplier: 1 },
    conditionalAttackDamageMultipliers: {
      counterattack: damageTypes(), critical: damageTypes(), finalChainAttack: damageTypes(),
      mounted: damageTypes(), jumping: damageTypes(), guardCounter: damageTypes(),
    },
    hpConditionedDamageEffect: {
      activation: null, thresholdPercent: null,
      outgoingDamageMultipliers: damageTypes(), incomingDamageMultipliers: damageTypes(),
    },
    specializedAttackEffects: {
      projectileRangeBonus: 0, rangedDamageMultipliers: damageTypes(),
      roarAndBreathDamageMultipliers: damageTypes(),
      chargedSpellAndSkillDamageMultipliers: damageTypes(),
      throwablePotDamageMultipliers: damageTypes(), perfumeDamageMultipliers: damageTypes(),
    },
    successiveAttackEffect: { stages: [] },
    triggeredDamageEffect: { trigger: null, durationSeconds: 0, damageMultipliers: damageTypes() },
    eventRecoveryEffect: {
      trigger: null, accumulatorThreshold: null,
      maxHpRecoveryPercent: 0, flatHpRecovery: 0, flatFpRecovery: 0,
    },
    miscellaneousEffects: {
      silentMovement: false, fallDamageMultiplier: 1, enemyTargetPriorityModifier: 0,
      preventsRuneLoss: false, appearance: null,
    },
    specialDefenseEffects: {
      criticalDamageMultipliers: damageTypes(), dodgeEffectRefreshSeconds: 0,
      dodgeEffectDurationSeconds: 0, reducesHeadshotImpact: false,
      concealsAtDistanceWhileCrouching: false,
    },
    attributeBonuses: {
      vigor: 0, mind: 0, endurance: 0, strength: 0,
      dexterity: 0, intelligence: 0, faith: 0, arcane: 0,
    },
    incomingDamageMultipliers: damageTypes(),
    outgoingDamageMultipliers: damageTypes(),
    skillDamageMultipliers: damageTypes(),
    chargedAttackDamageMultipliers: damageTypes(),
  };
}
