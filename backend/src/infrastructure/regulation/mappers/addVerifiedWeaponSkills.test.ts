import { describe, expect, it } from "vitest";
import { createRegulationWeaponCatalogFixture } from "../../../test/fixtures/regulationWeaponCatalog.fixture";
import type { WeaponParamRow } from "../schemas/weaponParam.schema";
import type { AttackParamRow, BehaviorParamRow } from "../schemas/weaponAttackParam.schema";
import type { FinalDamageRateRow } from "../schemas/weaponSkillParam.schema";
import { addVerifiedWeaponSkills } from "./addVerifiedWeaponSkills";

describe("addVerifiedWeaponSkills", () => {
  it("adds the verified Transient Moonlight profile to Moonveil", () => {
    const dataSet = createRegulationWeaponCatalogFixture();
    dataSet.catalog.moonveil!.skills = [];

    const result = addVerifiedWeaponSkills(
      dataSet,
      [{ ID: 9060000, Name: "Moonveil", atkAttribute: 0, atkAttribute2: 2 } as WeaponParamRow],
      {
        behaviors: [
          behavior(300905900, 900, 1, 2950),
          behavior(300905901, 901, 0, 303400101),
          behavior(300905905, 905, 1, 2955),
          behavior(300905906, 906, 0, 303400106),
        ],
        attacks: [
          attack(303400100, 1, 10003),
          attack(303400101, 0, 10000),
          attack(303400105, 1, 10003),
          attack(303400106, 0, 10000),
        ],
        bullets: [
          { ID: 2950, Name: "Transient Moonlight", atkId_Bullet: 303400100, intervalCreateBulletId: 2951 },
          { ID: 2955, Name: "Transient Moonlight", atkId_Bullet: 303400105, intervalCreateBulletId: 2956 },
        ],
        swordArts: [
          { ID: 1178, Name: "Transient Moonlight", useMagicPoint_L1: -1, useMagicPoint_L2: 0, useMagicPoint_R1: 15, useMagicPoint_R2: 20 },
        ],
        finalDamageRates: [rates(10000, 0.8), rates(10003, 0.65)],
      },
    );

    expect(result.catalog.moonveil?.skills).toHaveLength(1);
    expect(result.catalog.moonveil?.skills[0]).toMatchObject({
      id: "transient-moonlight",
      attacks: [
        { id: "transient-moonlight-light", fpCost: 15 },
        { id: "transient-moonlight-heavy", fpCost: 20 },
      ],
    });
  });
});

function behavior(ID: number, behaviorJudgeId: number, refType: number, refId: number): BehaviorParamRow {
  return { ID, Name: "Transient Moonlight", variationId: 905, behaviorJudgeId, refType, refId };
}

function attack(ID: number, isAddBaseAtk: 0 | 1, finalDamageRateId: number): AttackParamRow {
  return {
    ID, Name: "Transient Moonlight", atkPhysCorrection: 50, atkMagCorrection: 50,
    atkFireCorrection: 50, atkThunCorrection: 50, atkDarkCorrection: 50,
    atkPhys: 0, atkMag: 140, atkFire: 0, atkThun: 0, atkDark: 0,
    atkAttribute: 0, isAddBaseAtk, finalDamageRateId,
  };
}

function rates(ID: number, value: number): FinalDamageRateRow {
  return {
    ID, Name: "", physRate: value, magRate: value, fireRate: value,
    thunRate: value, darkRate: value,
  };
}
