import { describe, expect, it } from "vitest";
import {
  parseBulletParamCsv,
  parseFinalDamageRateCsv,
} from "./parseWeaponSkillCsv";

describe("parseWeaponSkillCsv", () => {
  it("accepts Smithbox names containing an unescaped quote", () => {
    const rows = parseBulletParamCsv(
      'ID,Name,atkId_Bullet,intervalCreateBulletId\n4170,Prattling Pate "Hello",123,-1',
    );

    expect(rows[0]).toMatchObject({
      ID: 4170,
      Name: 'Prattling Pate "Hello"',
      atkId_Bullet: 123,
    });
  });

  it("converts final damage rates", () => {
    const rows = parseFinalDamageRateCsv(
      "ID,Name,physRate,magRate,fireRate,thunRate,darkRate\n10003,,0.65,0.65,0.65,0.65,0.65",
    );

    expect(rows[0]?.magRate).toBe(0.65);
  });
});
