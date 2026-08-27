import { describe, expect, it } from "vitest";
import { moonveilAttackDefinitions } from "../data/moonveilAttackDefinitions";
import type { WeaponParamRow } from "../schemas/weaponParam.schema";
import type {
  AttackParamRow,
  BehaviorParamRow,
} from "../schemas/weaponAttackParam.schema";
import { mapRegulationWeaponAttacks } from "./mapRegulationWeaponAttacks";

describe("mapRegulationWeaponAttacks", () => {
  it("maps verified Moonveil katana behaviors to their motion values", () => {
    const profiles = mapRegulationWeaponAttacks(
      moonveil,
      moonveilAttackDefinitions,
      behaviors,
      attacks,
    );

    expect(profiles).toEqual([
      expect.objectContaining({
        id: "katana-attack-100",
        sourceAttackId: 900100,
        motionValues: allMotionValues(125),
        physicalAttackType: "slash",
      }),
      expect.objectContaining({
        id: "katana-attack-110",
        sourceAttackId: 900110,
        motionValues: allMotionValues(125),
        physicalAttackType: "standard",
      }),
      expect.objectContaining({
        id: "katana-attack-300",
        sourceAttackId: 900300,
        motionValues: allMotionValues(130),
        physicalAttackType: "standard",
      }),
    ]);
  });

  it("does not follow projectile behaviors", () => {
    expect(() =>
      mapRegulationWeaponAttacks(
        moonveil,
        [{ id: "skill", name: "Skill", behaviorVariationId: 905, behaviorJudgeId: 900 }],
        [{ ID: 300905900, Name: "Transient Moonlight", variationId: 905, behaviorJudgeId: 900, refType: 1, refId: 2950 }],
        attacks,
      ),
    ).toThrow("Expected one direct attack behavior 905:900, found 0");
  });

  it("rejects ambiguous behavior mappings", () => {
    expect(() =>
      mapRegulationWeaponAttacks(
        moonveil,
        [moonveilAttackDefinitions[0]],
        [behaviors[0]!, { ...behaviors[0]!, ID: 999 }],
        attacks,
      ),
    ).toThrow("Expected one direct attack behavior 900:100, found 2");
  });
});

const moonveil = {
  ID: 9060000,
  Name: "Moonveil",
  atkAttribute: 0,
  atkAttribute2: 2,
} as WeaponParamRow;

const behaviors: BehaviorParamRow[] = [
  behavior(100, 900100),
  behavior(110, 900110),
  behavior(300, 900300),
];

const attacks: AttackParamRow[] = [
  attack(900100, 125, 252),
  attack(900110, 125, 253),
  attack(900300, 130, 253),
];

function behavior(judgeId: number, attackId: number): BehaviorParamRow {
  return { ID: 100900000 + judgeId, Name: "Default - Katana", variationId: 900, behaviorJudgeId: judgeId, refType: 0, refId: attackId };
}

function attack(id: number, motionValue: number, atkAttribute: number): AttackParamRow {
  return { ID: id, Name: "Default - Katana", atkPhysCorrection: motionValue, atkMagCorrection: motionValue, atkFireCorrection: motionValue, atkThunCorrection: motionValue, atkDarkCorrection: motionValue, atkPhys: 0, atkMag: 0, atkFire: 0, atkThun: 0, atkDark: 0, atkAttribute, isAddBaseAtk: 0, finalDamageRateId: -1 };
}

function allMotionValues(value: number) {
  return { physical: value, magic: value, fire: value, lightning: value, holy: value };
}
