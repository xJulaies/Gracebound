import { describe, expect, it } from "vitest";
import { moonveilSkillDefinition } from "../data/moonveilSkillDefinition";
import type { WeaponParamRow } from "../schemas/weaponParam.schema";
import type { AttackParamRow, BehaviorParamRow } from "../schemas/weaponAttackParam.schema";
import type { BulletParamRow, FinalDamageRateRow, SwordArtsParamRow } from "../schemas/weaponSkillParam.schema";
import { mapRegulationWeaponSkill } from "./mapRegulationWeaponSkill";

describe("mapRegulationWeaponSkill", () => {
  it("maps both Transient Moonlight variants as projectile and weapon-hit components", () => {
    const skill = mapRegulationWeaponSkill(moonveil, moonveilSkillDefinition, tables);

    expect(skill).toMatchObject({
      id: "transient-moonlight",
      name: "Transient Moonlight",
      sourceSwordArtId: 1178,
      attacks: [
        {
          fpCost: 15,
          components: [
            { kind: "projectile", sourceBulletId: 2950, addedDamage: damage(0, 140), finalDamageRates: rates(0.65) },
            { kind: "weapon-hit", motionValues: allDamage(50), finalDamageRates: rates(0.8) },
          ],
        },
        {
          fpCost: 20,
          components: [
            { kind: "projectile", sourceBulletId: 2955, addedDamage: damage(0, 155), finalDamageRates: rates(0.65) },
            { kind: "weapon-hit", motionValues: allDamage(55), finalDamageRates: rates(0.8) },
          ],
        },
      ],
    });
  });
});

const moonveil = { ID: 9060000, Name: "Moonveil", atkAttribute: 0, atkAttribute2: 2 } as WeaponParamRow;
const behaviors: BehaviorParamRow[] = [
  behavior(300905900, 900, 1, 2950), behavior(300905901, 901, 0, 303400101),
  behavior(300905905, 905, 1, 2955), behavior(300905906, 906, 0, 303400106),
];
const attacks: AttackParamRow[] = [
  attack(303400100, 0, 140, 3, 1, 10003), attack(303400101, 50, 0, 0, 0, 10000),
  attack(303400105, 0, 155, 3, 1, 10003), attack(303400106, 55, 0, 0, 0, 10000),
];
const bullets: BulletParamRow[] = [
  { ID: 2950, Name: "Transient Moonlight", atkId_Bullet: 303400100, intervalCreateBulletId: 2951 },
  { ID: 2955, Name: "Transient Moonlight", atkId_Bullet: 303400105, intervalCreateBulletId: 2956 },
];
const swordArts: SwordArtsParamRow[] = [{ ID: 1178, Name: "Transient Moonlight", useMagicPoint_R1: 15, useMagicPoint_R2: 20 }];
const finalDamageRates: FinalDamageRateRow[] = [
  { ID: 10000, Name: "", physRate: 0.8, magRate: 0.8, fireRate: 0.8, thunRate: 0.8, darkRate: 0.8 },
  { ID: 10003, Name: "", physRate: 0.65, magRate: 0.65, fireRate: 0.65, thunRate: 0.65, darkRate: 0.65 },
];
const tables = { behaviors, attacks, bullets, swordArts, finalDamageRates };

function behavior(ID: number, behaviorJudgeId: number, refType: number, refId: number): BehaviorParamRow {
  return { ID, Name: "Transient Moonlight", variationId: 905, behaviorJudgeId, refType, refId };
}

function attack(ID: number, correction: number, magic: number, atkAttribute: number, isAddBaseAtk: 0 | 1, finalDamageRateId: number): AttackParamRow {
  return { ID, Name: "Transient Moonlight", atkPhysCorrection: correction, atkMagCorrection: correction, atkFireCorrection: correction, atkThunCorrection: correction, atkDarkCorrection: correction, atkPhys: 0, atkMag: magic, atkFire: 0, atkThun: 0, atkDark: 0, atkAttribute, isAddBaseAtk, finalDamageRateId };
}

function damage(physical: number, magic: number) {
  return { physical, magic, fire: 0, lightning: 0, holy: 0 };
}

function rates(value: number) {
  return { physical: value, magic: value, fire: value, lightning: value, holy: value };
}

function allDamage(value: number) {
  return { physical: value, magic: value, fire: value, lightning: value, holy: value };
}
