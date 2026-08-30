import { describe, expect, it } from "vitest";
import type { ArmorParamRow } from "../schemas/armor.schema";
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

  it("excludes placeholders and DLC rows", () => {
    expect(mapBaseGameArmor([
      { ...row(), ID: 10_000, Name: "Head" },
      { ...row(), ID: 5_000_000, Name: "Oathseeker Knight Helm" },
    ])).toEqual([]);
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
