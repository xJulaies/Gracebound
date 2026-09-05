import { describe, expect, it } from "vitest";
import { neutralArmorPassiveEffects, type ArmorData, type ArmorSlot } from "../../armor/domain/armor.types";
import { applyIncomingDamageMultipliers, calculateArmorStats } from "./calculateArmorStats";

describe("calculateArmorStats", () => {
  it("combines armor weight, poise, negation, and resistance points", () => {
    const result = calculateArmorStats([
      armor("helm", "head", 0.1, 4, 7, false),
      armor("chest", "body", 0.2, 8.3, 15, true),
    ]);
    expect(result).toMatchObject({
      equipmentWeight: 12.3,
      poise: 22,
      damageNegation: { physical: 0.28, strike: 0.28 },
      resistanceBonuses: { poison: 20, deathBlight: 20 },
      hasUnresolvedPassiveEffects: true,
    });
  });

  it("rejects two pieces for the same slot", () => {
    expect(() => calculateArmorStats([
      armor("helm", "head", 0.1, 4, 7, false),
      armor("other-helm", "head", 0.2, 5, 8, false),
    ])).toThrow("Only one armor piece per slot is allowed");
  });

  it("combines supported passive armor effects", () => {
    const first = armor("helm", "head", 0.1, 4, 7, true);
    first.passiveEffects.attributeBonuses.vigor = 1;
    first.passiveEffects.resourceMultipliers.maxHp = 0.9;
    first.passiveEffects.fpCostMultipliers.skill = 0.85;
    first.passiveEffects.incomingDamageMultipliers.physical = 1.1;
    first.passiveEffects.statusResistanceBonuses.sleep = -50;
    first.passiveEffects.flaskRecoveryMultipliers.hp = 1.1;
    first.passiveEffects.conditionalAttackBoosts.push({
      trigger: "blood-loss-nearby", durationSeconds: 20,
      outgoingDamageMultipliers: { physical: 1.1, magic: 1.1, fire: 1.1, lightning: 1.1, holy: 1.1 },
    });
    first.passiveEffects.regenerationEffects.push({ target: "wearer", hpPerSecond: 2, maximumHpPercent: 18, radius: null });
    first.passiveEffects.utilityEffects.enemyHearingMultiplier = 0;
    first.passiveEffects.utilityEffects.aggroPriorityModifier = 0.03;
    first.passiveEffects.utilityEffects.dodgeContactPhysicalDamage = 18;
    first.passiveEffects.scopedDamageBoosts.push({
      scope: "jumping-attacks",
      damageMultipliers: { physical: 1.1, magic: 1.1, fire: 1.1, lightning: 1.1, holy: 1.1 },
    });
    const second = armor("chest", "body", 0.2, 8, 15, true);
    second.passiveEffects.attributeBonuses.vigor = 2;
    second.passiveEffects.resourceMultipliers.maxHp = 1.1;

    expect(calculateArmorStats([first, second]).passiveEffects).toMatchObject({
      attributeBonuses: { vigor: 3 },
      resourceMultipliers: { maxHp: 0.99 },
      fpCostMultipliers: { skill: 0.85 },
      incomingDamageMultipliers: { physical: 1.1 },
      statusResistanceBonuses: { sleep: -50 },
      flaskRecoveryMultipliers: { hp: 1.1, fp: 1 },
      conditionalAttackBoosts: [{ trigger: "blood-loss-nearby", durationSeconds: 20 }],
      regenerationEffects: [{ target: "wearer", hpPerSecond: 2, maximumHpPercent: 18, radius: null }],
      utilityEffects: { enemyHearingMultiplier: 0, aggroPriorityModifier: 0.03, dodgeContactPhysicalDamage: 18, reducesHeadshotImpact: false },
      scopedDamageBoosts: [{ scope: "jumping-attacks" }],
    });
  });

  it("combines armor negation with defensive incoming-damage multipliers", () => {
    const armorNegation = armor("helm", "head", 0.2, 4, 7, false).damageNegation;

    expect(applyIncomingDamageMultipliers(armorNegation, {
      physical: 0.9,
      magic: 0.8,
      fire: 1,
      lightning: 0.7,
      holy: 1,
    })).toEqual({
      physical: 0.28,
      strike: 0.28,
      slash: 0.28,
      pierce: 0.28,
      magic: 0.36,
      fire: 0.2,
      lightning: 0.44,
      holy: 0.2,
    });
  });
});

function armor(id: string, slot: ArmorSlot, negation: number, weight: number, poise: number, passive: boolean): ArmorData {
  return {
    id, name: id, slot, sourceProtectorId: id.length, iconId: 1, weight, poise,
    damageNegation: { physical: negation, strike: negation, slash: negation, pierce: negation, magic: negation, fire: negation, lightning: negation, holy: negation },
    resistances: { poison: 10, rot: 10, bleed: 10, frost: 10, sleep: 10, madness: 10, deathBlight: 10 },
    sourceEffectIds: passive ? [100] : [],
    hasUnresolvedPassiveEffects: passive,
    passiveEffects: neutralArmorPassiveEffects(),
  };
}
