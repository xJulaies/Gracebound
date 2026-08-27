import { describe, expect, it } from "vitest";
import {
  parseAttackParamCsv,
  parseBehaviorParamCsv,
} from "./parseWeaponAttackCsv";

describe("parseBehaviorParamCsv", () => {
  it("validates and converts a Smithbox behavior row", () => {
    const rows = parseBehaviorParamCsv(
      "ID,Name,variationId,behaviorJudgeId,refType,refId,\n100900100,Default - Katana,900,100,0,900100",
    );

    expect(rows[0]).toEqual({
      ID: 100900100,
      Name: "Default - Katana",
      variationId: 900,
      behaviorJudgeId: 100,
      refType: 0,
      refId: 900100,
    });
  });
});

describe("parseAttackParamCsv", () => {
  it("validates all attack values needed by the mapper", () => {
    const rows = parseAttackParamCsv(
      "ID,Name,atkPhysCorrection,atkMagCorrection,atkFireCorrection,atkThunCorrection,atkDarkCorrection,atkPhys,atkMag,atkFire,atkThun,atkDark,atkAttribute,isAddBaseAtk,finalDamageRateId,\n900100,Default - Katana,125,125,125,125,125,0,0,0,0,0,252,0,-1",
    );

    expect(rows[0]).toMatchObject({
      ID: 900100,
      atkPhysCorrection: 125,
      atkAttribute: 252,
    });
  });

  it("rejects an invalid motion value", () => {
    expect(() =>
      parseAttackParamCsv(
        "ID,Name,atkPhysCorrection,atkMagCorrection,atkFireCorrection,atkThunCorrection,atkDarkCorrection,atkPhys,atkMag,atkFire,atkThun,atkDark,atkAttribute,isAddBaseAtk,finalDamageRateId\n900100,Default,-1,125,125,125,125,0,0,0,0,0,252,0,-1",
      ),
    ).toThrow();
  });
});
