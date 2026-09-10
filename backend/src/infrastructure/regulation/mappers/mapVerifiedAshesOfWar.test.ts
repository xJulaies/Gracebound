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

  it("maps Black Flame Tornado normal and fully charged sequences for every compatible weapon class", () => {
    const blackFlameTornado = mapVerifiedAshesOfWar(
      [gem(22100, "Black Flame Tornado", 221)],
      [
        longsword,
        referenceWeapon(24, 3), referenceWeapon(36, 3),
        referenceWeapon(37, 3), referenceWeapon(38, 3), referenceWeapon(50, 2),
      ],
      {
        behaviors: [
          behavior(300000300, 300, 1, 2430),
          behavior(300000301, 301, 1, 2431),
          behavior(300000305, 305, 0, 300000305),
          behavior(300000306, 306, 0, 300000306),
        ],
        attacks: [
          attack(300000300, 1, 3, 0, 65),
          attack(300000301, 1, 3, 0, 170),
          attack(300000305, 0, 253, 50, 0),
          attack(300000306, 0, 2, 100, 0),
        ],
        bullets: [
          { ID: 2430, Name: "Black Flame Tornado", atkId_Bullet: 300000300, intervalCreateBulletId: -1 },
          { ID: 2431, Name: "Black Flame Tornado finish", atkId_Bullet: 300000301, intervalCreateBulletId: -1 },
        ],
        swordArts: [{
          ID: 221, Name: "Black Flame Tornado", useMagicPoint_L1: -1,
          useMagicPoint_L2: 30, useMagicPoint_R1: -1, useMagicPoint_R2: -1,
        }],
        finalDamageRates: [{
          ID: 10000, Name: "", physRate: 1, magRate: 1,
          fireRate: 1, thunRate: 1, darkRate: 1,
        }],
      },
    )[0]!;

    expect(blackFlameTornado.calculationStatus).toBe("supported");
    expect(blackFlameTornado.skill).toBeNull();
    expect(blackFlameTornado.skillVariants).toHaveLength(5);
    expect(blackFlameTornado.skillVariants.map(({ weaponTypes, skill }) => ({
      weaponType: weaponTypes[0],
      attackIds: skill.attacks.map(({ id }) => id),
      componentCounts: skill.attacks.map(({ components }) => components.length),
      fpCosts: skill.attacks.map(({ fpCost }) => fpCost),
      effectCounts: skill.attacks.map(({ targetHealthEffects }) => targetHealthEffects?.[0]?.applicationCount),
      initialAttackType: skill.attacks[0]?.components[0]?.physicalAttackType,
      finishingAttackType: skill.attacks[0]?.components[1]?.physicalAttackType,
    }))).toEqual([
      { weaponType: "twinblade", attackIds: ["black-flame-tornado", "black-flame-tornado-fully-charged"], componentCounts: [3, 8], fpCosts: [30, 30], effectCounts: [1, 5], initialAttackType: "pierce", finishingAttackType: "slash" },
      { weaponType: "spear", attackIds: ["black-flame-tornado", "black-flame-tornado-fully-charged"], componentCounts: [3, 8], fpCosts: [30, 30], effectCounts: [1, 5], initialAttackType: "pierce", finishingAttackType: "slash" },
      { weaponType: "great-spear", attackIds: ["black-flame-tornado", "black-flame-tornado-fully-charged"], componentCounts: [3, 8], fpCosts: [30, 30], effectCounts: [1, 5], initialAttackType: "pierce", finishingAttackType: "slash" },
      { weaponType: "halberd", attackIds: ["black-flame-tornado", "black-flame-tornado-fully-charged"], componentCounts: [3, 8], fpCosts: [30, 30], effectCounts: [1, 5], initialAttackType: "pierce", finishingAttackType: "slash" },
      { weaponType: "reaper", attackIds: ["black-flame-tornado", "black-flame-tornado-fully-charged"], componentCounts: [3, 8], fpCosts: [30, 30], effectCounts: [1, 5], initialAttackType: "slash", finishingAttackType: "slash" },
    ]);
  });

  it("maps all three Storm Blade combo stages with their weapon and projectile hits", () => {
    const stormBlade = mapVerifiedAshesOfWar(
      [gem(21000, "Storm Blade", 210)],
      [
        longsword,
        ...[20, 23, 25, 28, 40, 29, 27, 39, 60, 61].map((category) =>
          referenceWeapon(category, category === 27 || category === 39 ? 3 : 0)),
      ],
      {
        behaviors: [
          behavior(300000407, 407, 0, 300000407),
          behavior(300000408, 408, 0, 300000408),
          behavior(300000409, 409, 0, 300000409),
          behavior(300000410, 410, 1, 2060),
        ],
        attacks: [
          attack(300000407, 0, 253, 65, 0),
          attack(300000408, 0, 253, 66, 0),
          attack(300000409, 0, 253, 67, 0),
          {
            ...attack(300000410, 1, 3, 0, 0),
            atkPhys: 150,
          },
        ],
        bullets: [{ ID: 2060, Name: "Storm Blade", atkId_Bullet: 300000410, intervalCreateBulletId: -1 }],
        swordArts: [{
          ID: 210, Name: "Storm Blade", useMagicPoint_L1: -1,
          useMagicPoint_L2: 10, useMagicPoint_R1: -1, useMagicPoint_R2: 6,
        }],
        finalDamageRates: [{
          ID: 10000, Name: "", physRate: 1, magRate: 1,
          fireRate: 1, thunRate: 1, darkRate: 1,
        }],
      },
    )[0]!;

    expect(stormBlade.calculationStatus).toBe("supported");
    expect(stormBlade.skillVariants).toHaveLength(10);
    expect(stormBlade.skillVariants[0]?.skill.attacks.map(({ id, fpCost, components }) => ({
      id,
      fpCost,
      motionValue: components[0]?.motionValues.physical,
      projectileDamage: components[1]?.addedDamage.physical,
    }))).toEqual([
      { id: "storm-blade-1", fpCost: 10, motionValue: 65, projectileDamage: 150 },
      { id: "storm-blade-2", fpCost: 6, motionValue: 66, projectileDamage: 150 },
      { id: "storm-blade-3", fpCost: 6, motionValue: 67, projectileDamage: 150 },
    ]);
  });

  it("maps Vacuum Slice as a combined close-range weapon and projectile hit", () => {
    const categories = [20, 23, 25, 26, 28, 40, 29, 24, 27, 39, 30, 32, 60, 61];
    const vacuumSlice = mapVerifiedAshesOfWar(
      [gem(22000, "Vacuum Slice", 220)],
      [longsword, ...categories.filter((category) => category !== 20).map((category) => referenceWeapon(category, 0))],
      {
        behaviors: [
          behavior(300000415, 415, 1, 2061),
          behavior(300000417, 417, 0, 300000417),
        ],
        attacks: [
          attack(300000417, 0, 253, 75, 0),
          { ...attack(300000415, 1, 3, 0, 0), atkPhys: 200 },
        ],
        bullets: [{ ID: 2061, Name: "Vacuum Slice", atkId_Bullet: 300000415, intervalCreateBulletId: -1 }],
        swordArts: [{
          ID: 220, Name: "Vacuum Slice", useMagicPoint_L1: -1,
          useMagicPoint_L2: 14, useMagicPoint_R1: -1, useMagicPoint_R2: -1,
        }],
        finalDamageRates: [{
          ID: 10000, Name: "", physRate: 1, magRate: 1,
          fireRate: 1, thunRate: 1, darkRate: 1,
        }],
      },
    )[0]!;

    expect(vacuumSlice.skillVariants).toHaveLength(14);
    expect(vacuumSlice.skillVariants[0]?.skill.attacks[0]).toMatchObject({
      id: "vacuum-slice",
      fpCost: 14,
      components: [
        { kind: "weapon-hit", motionValues: { physical: 75 } },
        { kind: "projectile", addedDamage: { physical: 200 } },
      ],
    });
  });
});

function gem(ID: number, name: string, swordArtsParamId: number): EquipParamGemRow {
  return { ID, Name: `Ash of War: ${name}`, iconId: ID, swordArtsParamId };
}

const longsword = {
  ID: 1000000, Name: "Longsword", originEquipWep: 1000000, wepmotionCategory: 20, atkAttribute: 0,
} as WeaponParamRow;

function referenceWeapon(wepmotionCategory: number, atkAttribute: number): WeaponParamRow {
  return {
    ID: wepmotionCategory, Name: `Reference ${wepmotionCategory}`,
    originEquipWep: wepmotionCategory, wepmotionCategory, atkAttribute,
  } as WeaponParamRow;
}

const emptySkillTables = { behaviors: [], attacks: [], bullets: [], swordArts: [], finalDamageRates: [] };

function behavior(ID: number, behaviorJudgeId: number, refType: number, refId: number) {
  return { ID, Name: "Black Flame Tornado", variationId: 0, behaviorJudgeId, refType, refId };
}

function attack(
  ID: number,
  isAddBaseAtk: number,
  atkAttribute: number,
  weaponMotionValue: number,
  addedFire: number,
) {
  return {
    ID, Name: "Black Flame Tornado", isAddBaseAtk, atkAttribute,
    atkPhysCorrection: weaponMotionValue, atkMagCorrection: weaponMotionValue,
    atkFireCorrection: weaponMotionValue, atkThunCorrection: weaponMotionValue,
    atkDarkCorrection: weaponMotionValue,
    atkPhys: 0, atkMag: 0, atkFire: addedFire, atkThun: 0, atkDark: 0,
    finalDamageRateId: 10000,
  };
}

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
