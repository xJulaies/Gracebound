import { describe, expect, it } from "vitest";
import type { ArmorEffectRow } from "../schemas/armor.schema";
import type { WeaponParamRow } from "../schemas/weaponParam.schema";
import type { EquipParamGemRow } from "../schemas/weaponSkillParam.schema";
import { mapVerifiedAshesOfWar } from "./mapVerifiedAshesOfWar";

describe("mapVerifiedAshesOfWar skill buffs", () => {
  it("maps duration, next-hit, added damage, status, and poise modifiers", () => {
    const ashes = mapVerifiedAshesOfWar([
      gem(60000, "Determination", 600), gem(60600, "Seppuku", 606),
      gem(60700, "Cragblade", 607),
    ], [longsword], emptySkillTables, [
      effect(1691, 10, { outgoing: 1.6 }),
      effect(1755, 60, { physical: 30, hitEffectId: 1756 }),
      effect(1756, 0, { bleed: 30 }),
      effect(1821, 60, { physicalRate: 1.15, poiseRate: 1.1 }),
    ]);

    expect(ashes.map(({ id, calculationStatus, buffEffect }) => ({ id, calculationStatus, buffEffect }))).toMatchObject([
      { id: "determination", calculationStatus: "supported", buffEffect: {
        durationSeconds: 10, consumption: "next-hit", outgoingDamageMultipliers: { physical: 1.6 },
      } },
      { id: "seppuku", calculationStatus: "supported", buffEffect: {
        durationSeconds: 60, addedDamage: { physical: 30 }, addedStatusBuildup: { bleed: 30 },
      } },
      { id: "cragblade", calculationStatus: "supported", buffEffect: {
        durationSeconds: 60, attackPowerMultipliers: { physical: 1.15 }, poiseDamageMultiplier: 1.1,
      } },
    ]);
  });

  it("maps Prayerful Strike with weapon-class-specific physical attack types", () => {
    const prayerfulStrike = mapVerifiedAshesOfWar(
      [gem(20800, "Prayerful Strike", 208)],
      [
        longsword,
        referenceWeapon(30, 3), referenceWeapon(32, 0),
        referenceWeapon(33, 1), referenceWeapon(35, 1),
        referenceWeapon(34, 1), referenceWeapon(31, 1),
      ],
      {
        behaviors: [{
          ID: 300000102, Name: "Prayerful Strike", variationId: 0,
          behaviorJudgeId: 102, refType: 0, refId: 301200820,
        }],
        attacks: [{
          ID: 301200820, Name: "Prayerful Strike",
          atkPhysCorrection: 235, atkMagCorrection: 235, atkFireCorrection: 235,
          atkThunCorrection: 235, atkDarkCorrection: 235,
          atkPhys: 0, atkMag: 0, atkFire: 0, atkThun: 0, atkDark: 0,
          atkAttribute: 253, isAddBaseAtk: 0, finalDamageRateId: 10000,
        }],
        bullets: [],
        swordArts: [{
          ID: 208, Name: "Prayerful Strike", useMagicPoint_L1: -1,
          useMagicPoint_L2: 20, useMagicPoint_R1: -1, useMagicPoint_R2: -1,
        }],
        finalDamageRates: [{
          ID: 10000, Name: "", physRate: 1, magRate: 1,
          fireRate: 1, thunRate: 1, darkRate: 1,
        }],
      },
    )[0]!;

    expect(prayerfulStrike.calculationStatus).toBe("supported");
    expect(prayerfulStrike.skill).toBeNull();
    expect(prayerfulStrike.skillVariants).toHaveLength(6);
    expect(prayerfulStrike.skillVariants.map(({ weaponTypes, skill }) => ({
      weaponType: weaponTypes[0],
      fpCost: skill.attacks[0]?.fpCost,
      motionValue: skill.attacks[0]?.components[0]?.motionValues.physical,
      physicalAttackType: skill.attacks[0]?.components[0]?.physicalAttackType,
    }))).toEqual([
      { weaponType: "axe", fpCost: 20, motionValue: 235, physicalAttackType: "pierce" },
      { weaponType: "greataxe", fpCost: 20, motionValue: 235, physicalAttackType: "standard" },
      { weaponType: "hammer", fpCost: 20, motionValue: 235, physicalAttackType: "strike" },
      { weaponType: "great-hammer", fpCost: 20, motionValue: 235, physicalAttackType: "strike" },
      { weaponType: "flail", fpCost: 20, motionValue: 235, physicalAttackType: "strike" },
      { weaponType: "colossal-weapon", fpCost: 20, motionValue: 235, physicalAttackType: "strike" },
    ]);
  });
});

function gem(ID: number, name: string, swordArtsParamId: number): EquipParamGemRow {
  return { ID, Name: `Ash of War: ${name}`, iconId: ID, swordArtsParamId };
}

const longsword = {
  ID: 1000000, Name: "Longsword", originEquipWep: 1000000, wepmotionCategory: 20,
} as WeaponParamRow;

function referenceWeapon(wepmotionCategory: number, atkAttribute: number): WeaponParamRow {
  return {
    ID: wepmotionCategory, Name: `Reference ${wepmotionCategory}`,
    originEquipWep: wepmotionCategory, wepmotionCategory, atkAttribute,
  } as WeaponParamRow;
}

const emptySkillTables = { behaviors: [], attacks: [], bullets: [], swordArts: [], finalDamageRates: [] };

function effect(
  ID: number,
  effectEndurance: number,
  values: { outgoing?: number; physical?: number; physicalRate?: number; poiseRate?: number; bleed?: number; hitEffectId?: number },
): ArmorEffectRow {
  return {
    ID, effectEndurance,
    atkEnemyDmgCorrectRate_Physics: values.outgoing ?? 1,
    atkEnemyDmgCorrectRate_Magic: values.outgoing ?? 1,
    atkEnemyDmgCorrectRate_Fire: values.outgoing ?? 1,
    atkEnemyDmgCorrectRate_Thunder: values.outgoing ?? 1,
    atkEnemyDmgCorrectRate_Dark: values.outgoing ?? 1,
    physicsAttackPowerRate: values.physicalRate ?? 1,
    magicAttackPowerRate: 1, fireAttackPowerRate: 1, thunderAttackPowerRate: 1, darkAttackPowerRate: 1,
    physicsAttackPower: values.physical ?? 0, magicAttackPower: 0, fireAttackPower: 0,
    thunderAttackPower: 0, darkAttackPower: 0, atkOccurrenceSpEffectId: values.hitEffectId ?? -1,
    poizonAttackPower: 0, diseaseAttackPower: 0, bloodAttackPower: values.bleed ?? 0,
    curseAttackPower: 0, freezeAttackPower: 0, sleepAttackPower: 0, madnessAttackPower: 0,
    saAttackPowerRate: values.poiseRate ?? 1,
  } as ArmorEffectRow;
}
