import { describe, expect, it } from "vitest";
import type { ArmorEffectRow, ArmorParamRow } from "../schemas/armor.schema";
import { mapBaseGameArmor } from "./mapRegulationArmor";

describe("mapBaseGameArmor", () => {
  it("normalizes armor multipliers, poise, resistances, and passive IDs", () => {
    const [armor] = mapBaseGameArmor([row()]);
    expect(armor).toMatchObject({
      id: "vagabond-knight-helm", slot: "head", weight: 4, poise: 7,
      damageNegation: { physical: 0.046, strike: 0.036, slash: 0.042, pierce: 0.04, magic: 0.031, fire: 0.036, lightning: 0.028, holy: 0.028 },
      resistances: { poison: 14, rot: 14, bleed: 23, frost: 23, sleep: 9, madness: 9, deathBlight: 9 },
      sourceEffectIds: [100],
    });
  });

  it("excludes placeholders, unavailable cut content, and DLC rows", () => {
    expect(mapBaseGameArmor([
      { ...row(), ID: 10_000, Name: "Head" },
      { ...row(), ID: 920_000, Name: "Grass Hair Ornament", iconIdM: 14_520 },
      { ...row(), ID: 5_000_000, Name: "Oathseeker Knight Helm" },
    ])).toEqual([]);
  });

  it("maps supported passive effects from SpEffectParam", () => {
    const [armor] = mapBaseGameArmor([row()], [effectRow()]);

    expect(armor?.passiveEffects).toMatchObject({
      attributeBonuses: { vigor: 1, arcane: -1 },
      resourceMultipliers: { maxHp: 0.9 },
      fpCostMultipliers: { skill: 0.85 },
      incomingDamageMultipliers: { physical: 1.1 },
      statusResistanceBonuses: { sleep: -50, madness: -50 },
      flaskRecoveryMultipliers: { hp: 1.1, fp: 1 },
    });
  });

  it("follows verified conditional attack-boost effects", () => {
    const trigger = { ...effectRow(), invocationConditionsStateChange1: 379, cycleOccurrenceSpEffectId: 101 };
    const boost = {
      ...effectRow(), ID: 101, effectEndurance: 20,
      atkEnemyDmgCorrectRate_Physics: 1.1, atkEnemyDmgCorrectRate_Magic: 1.1,
      atkEnemyDmgCorrectRate_Fire: 1.1, atkEnemyDmgCorrectRate_Thunder: 1.1,
      atkEnemyDmgCorrectRate_Dark: 1.1,
    };

    expect(mapBaseGameArmor([row()], [trigger, boost])[0]?.passiveEffects.conditionalAttackBoosts).toEqual([{
      trigger: "blood-loss-nearby",
      durationSeconds: 20,
      outgoingDamageMultipliers: { physical: 1.1, magic: 1.1, fire: 1.1, lightning: 1.1, holy: 1.1 },
    }]);
  });

  it("maps wearer regeneration and utility effects", () => {
    const effect = {
      ...effectRow(), conditionHp: 18, motionInterval: 1, changeHpPoint: -2,
      hearingSearchEnemyRate: 0, targetPriority: 0.03, physicsAttackPower: 18,
    };

    expect(mapBaseGameArmor([row()], [effect])[0]?.passiveEffects).toMatchObject({
      regenerationEffects: [{ target: "wearer", hpPerSecond: 2, maximumHpPercent: 18, radius: null }],
      utilityEffects: { enemyHearingMultiplier: 0, aggroPriorityModifier: 0.03, dodgeContactPhysicalDamage: 18 },
    });
  });

  it("resolves Deathbed Dress ally regeneration through behavior and bullet data", () => {
    const source = { ...effectRow(), cycleOccurrenceSpEffectId: 101 };
    const emitter = { ...effectRow(), ID: 101, behaviorId: 2900 };
    const healing = { ...effectRow(), ID: 102, changeHpPoint: -2, motionInterval: 1 };

    const [armor] = mapBaseGameArmor([row()], [source, emitter, healing], {
      behaviors: [{ ID: 2900, refType: 1, refId: 900 }],
      bullets: [{ ID: 900, hitRadius: 7, spEffectId0: 102 }],
    });

    expect(armor?.passiveEffects.regenerationEffects).toEqual([
      { target: "nearby-allies", hpPerSecond: 2, maximumHpPercent: null, radius: 7 },
    ]);
  });

  it("keeps offensive armor bonuses in their verified scopes", () => {
    const thornArmor = { ...row(), residentSpEffectId: 6012000 };
    const thornEffect = {
      ...effectRow(), ID: 6012000, physicsAttackRate: 1.06, magicAttackRate: 1.06,
      fireAttackRate: 1.06, thunderAttackRate: 1.06, darkAttackRate: 1.06,
    };

    expect(mapBaseGameArmor([thornArmor], [thornEffect])[0]?.passiveEffects.scopedDamageBoosts).toEqual([{
      scope: "thorn-sorceries",
      damageMultipliers: { physical: 1.06, magic: 1.06, fire: 1.06, lightning: 1.06, holy: 1.06 },
    }]);
  });

  it("distinguishes resolved, cosmetic, and unknown effect rows", () => {
    const resolved = mapBaseGameArmor([row()], [{ ...effectRow(), addLifeForceStatus: 1 }])[0];
    const cosmetic = mapBaseGameArmor(
      [{ ...row(), residentSpEffectId: 1950 }],
      [{ ...effectRow(), ID: 1950 }],
    )[0];
    const unknown = mapBaseGameArmor(
      [{ ...row(), residentSpEffectId: 6044000 }],
      [{ ...effectRow(), ID: 6044000, stateInfo: 450 }],
    )[0];

    expect(resolved?.hasUnresolvedPassiveEffects).toBe(false);
    expect(cosmetic?.hasUnresolvedPassiveEffects).toBe(false);
    expect(unknown?.hasUnresolvedPassiveEffects).toBe(true);
    expect(unknown?.passiveEffects.utilityEffects.reducesHeadshotImpact).toBe(true);
  });
});

function row(): ArmorParamRow {
  return {
    ID: 660000, Name: "Vagabond Knight Helm", protectorCategory: 0, iconIdM: 123, weight: 4,
    toughnessCorrectRate: 0.007, neutralDamageCutRate: 0.954, slashDamageCutRate: 0.958,
    blowDamageCutRate: 0.964, thrustDamageCutRate: 0.96, magicDamageCutRate: 0.969,
    fireDamageCutRate: 0.964, thunderDamageCutRate: 0.972, darkDamageCutRate: 0.972,
    resistPoison: 14, resistDisease: 14, resistBlood: 23, resistFreeze: 23,
    resistSleep: 9, resistMadness: 9, resistCurse: 9,
    residentSpEffectId: 100, residentSpEffectId2: -1, residentSpEffectId3: -1,
  };
}

function effectRow(): ArmorEffectRow {
  return {
    ID: 100,
    addLifeForceStatus: 1, addWillpowerStatus: 0, addEndureStatus: 0, addStrengthStatus: 0,
    addDexterityStatus: 0, addMagicStatus: 0, addFaithStatus: 0, addLuckStatus: -1,
    maxHpRate: 0.9, maxMpRate: 1, maxStaminaRate: 1, equipWeightChangeRate: 1,
    artsConsumptionRate: 0.85, magicConsumptionRate: 1, miracleConsumptionRate: 1,
    neutralDamageCutRate: 1.1, magicDamageCutRate: 1, fireDamageCutRate: 1,
    thunderDamageCutRate: 1, darkDamageCutRate: 1,
    changePoisonResistPoint: 0, changeDiseaseResistPoint: 0, changeBloodResistPoint: 0,
    changeFreezeResistPoint: 0, changeSleepResistPoint: -50, changeMadnessResistPoint: -50,
    changeCurseResistPoint: 0, changeHpEstusFlaskCorrectRate: 1.1,
    changeMpEstusFlaskCorrectRate: 1,
    invocationConditionsStateChange1: 0, cycleOccurrenceSpEffectId: -1,
    atkOccurrenceSpEffectId: -1, effectEndurance: 0,
    atkEnemyDmgCorrectRate_Physics: 1, atkEnemyDmgCorrectRate_Magic: 1,
    atkEnemyDmgCorrectRate_Fire: 1, atkEnemyDmgCorrectRate_Thunder: 1,
    atkEnemyDmgCorrectRate_Dark: 1,
    conditionHp: -1, motionInterval: 0, changeHpPoint: 0,
    hearingSearchEnemyRate: 1, targetPriority: 0, physicsAttackPower: 0,
    magicAttackPower: 0, fireAttackPower: 0, thunderAttackPower: 0, darkAttackPower: 0,
    behaviorId: -1,
    physicsAttackRate: 1, magicAttackRate: 1, fireAttackRate: 1,
    thunderAttackRate: 1, darkAttackRate: 1, physicsAttackPowerRate: 1,
    stateInfo: 0,
    poizonAttackPower: 0, diseaseAttackPower: 0, bloodAttackPower: 0,
    curseAttackPower: 0, freezeAttackPower: 0, sleepAttackPower: 0,
    madnessAttackPower: 0,
  };
}
