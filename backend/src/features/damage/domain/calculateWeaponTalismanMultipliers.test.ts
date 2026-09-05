import { describe, expect, it } from "vitest";
import type { TalismanEffects } from "../../talismans/domain/talisman.types";
import { calculateWeaponTalismanMultipliers } from "./calculateWeaponTalismanMultipliers";

describe("calculateWeaponTalismanMultipliers", () => {
  it("applies Claw Talisman only to jumping attacks", () => {
    const effects = neutralEffects();
    effects.conditionalAttackDamageMultipliers.jumping = damageTypes(1.15);

    expect(calculateWeaponTalismanMultipliers([effects], {
      attackId: "straight-sword-1h-light-1",
    })).toEqual(damageTypes(1));
    expect(calculateWeaponTalismanMultipliers([effects], {
      attackId: "straight-sword-jumping-light-1",
    })).toEqual(damageTypes(1.15));
  });

  it("preserves general and charged-attack multipliers", () => {
    const effects = neutralEffects();
    effects.outgoingDamageMultipliers = damageTypes(1.1);
    effects.chargedAttackDamageMultipliers = damageTypes(1.2);

    expect(calculateWeaponTalismanMultipliers([effects], {
      attackId: "straight-sword-1h-charged-heavy-1",
    })).toEqual(damageTypes(1.32));
  });
});

function neutralEffects(): TalismanEffects {
  return {
    resourceMultipliers: { maxHp: 1, maxFp: 1, maxStamina: 1, maxEquipLoad: 1 },
    statusResistanceBonuses: { poison: 0, rot: 0, bleed: 0, frost: 0, sleep: 0, madness: 0, deathBlight: 0 },
    spellDamageMultipliers: { sorcery: 1, incantation: 1 },
    utilityEffects: {
      itemDiscoveryRateBonus: 0, runeAcquisitionMultiplier: 1, memorySlotBonus: 0,
      staminaRecoverySpeedBonus: 0, poiseDamageMultiplier: 1, skillFpCostMultiplier: 1,
      spellFpCostMultiplier: 1, spellEffectDurationMultiplier: 1,
      castingSpeedVirtualDexterity: 0,
    },
    recoveryEffects: { hpFlaskRecoveryMultiplier: 1, fpFlaskRecoveryMultiplier: 1, hpRecoveryPerSecond: 0 },
    guardEffects: { staminaDamageMultiplier: 1, staminaCostMultiplier: 1 },
    conditionalAttackDamageMultipliers: {
      counterattack: damageTypes(1), critical: damageTypes(1), finalChainAttack: damageTypes(1),
      mounted: damageTypes(1), jumping: damageTypes(1), guardCounter: damageTypes(1),
    },
    hpConditionedDamageEffect: {
      activation: null, thresholdPercent: null,
      outgoingDamageMultipliers: damageTypes(1), incomingDamageMultipliers: damageTypes(1),
    },
    specializedAttackEffects: {
      projectileRangeBonus: 0, rangedDamageMultipliers: damageTypes(1),
      roarAndBreathDamageMultipliers: damageTypes(1),
      chargedSpellAndSkillDamageMultipliers: damageTypes(1),
      throwablePotDamageMultipliers: damageTypes(1), perfumeDamageMultipliers: damageTypes(1),
    },
    successiveAttackEffect: { stages: [] },
    triggeredDamageEffect: { trigger: null, durationSeconds: 0, damageMultipliers: damageTypes(1) },
    eventRecoveryEffect: {
      trigger: null, accumulatorThreshold: null, maxHpRecoveryPercent: 0,
      flatHpRecovery: 0, flatFpRecovery: 0,
    },
    miscellaneousEffects: {
      silentMovement: false, fallDamageMultiplier: 1, enemyTargetPriorityModifier: 0,
      preventsRuneLoss: false, appearance: null,
    },
    specialDefenseEffects: {
      criticalDamageMultipliers: damageTypes(1), dodgeEffectRefreshSeconds: 0,
      dodgeEffectDurationSeconds: 0, reducesHeadshotImpact: false,
      concealsAtDistanceWhileCrouching: false,
    },
    attributeBonuses: {
      vigor: 0, mind: 0, endurance: 0, strength: 0, dexterity: 0,
      intelligence: 0, faith: 0, arcane: 0,
    },
    incomingDamageMultipliers: damageTypes(1),
    outgoingDamageMultipliers: damageTypes(1),
    skillDamageMultipliers: damageTypes(1),
    chargedAttackDamageMultipliers: damageTypes(1),
  };
}

function damageTypes(value: number) {
  return { physical: value, magic: value, fire: value, lightning: value, holy: value };
}
