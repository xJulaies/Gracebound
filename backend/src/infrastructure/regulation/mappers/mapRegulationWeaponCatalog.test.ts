import { describe, expect, it } from "vitest";
import type { WeaponParamRow } from "../schemas/weaponParam.schema";
import { getRegulationWeaponType } from "../data/regulationWeaponTypes";
import {
  getWeaponAffinity,
  isCanonicalPlayerWeapon,
  mapCastingTypes,
} from "./mapRegulationWeaponCatalog";

describe("isCanonicalPlayerWeapon", () => {
  it("includes self-referencing player armaments including daggers and fist weapons", () => {
    expect(isCanonicalPlayerWeapon(row(1000000, 1000000, 0, "Dagger", 1))).toBe(true);
    expect(isCanonicalPlayerWeapon(row(21000000, 21000000, 9, "Caestus", 35))).toBe(true);
  });

  it("excludes affinity, NPC, unnamed, and non-weapon rows", () => {
    expect(isCanonicalPlayerWeapon(row(2000100, 2000000, 1, "Heavy Longsword"))).toBe(false);
    expect(isCanonicalPlayerWeapon(row(2092000, 2090000, 1, "[NPC] Inseparable Sword"))).toBe(false);
    expect(isCanonicalPlayerWeapon(row(1000, 1000, 1, ""))).toBe(false);
    expect(isCanonicalPlayerWeapon(row(170000, 170000, 0, "Throwing Dagger", 0))).toBe(false);
  });
});

describe("getRegulationWeaponType", () => {
  it.each([
    [1, "dagger"],
    [23, "great-hammer"],
    [50, "light-bow"],
    [51, "bow"],
    [57, "glintstone-staff"],
    [61, "sacred-seal"],
    [69, "greatshield"],
    [89, "perfume-bottle"],
    [90, "thrusting-shield"],
    [91, "dagger"],
  ] as const)("maps Regulation weapon type %s to %s", (sourceTypeId, weaponType) => {
    expect(getRegulationWeaponType(sourceTypeId)).toBe(weaponType);
  });

  it("does not invent a type for an unknown Regulation value", () => {
    expect(getRegulationWeaponType(999)).toBeUndefined();
  });
});

describe("mapCastingTypes", () => {
  it("maps staff and sacred-seal Regulation flags", () => {
    expect(mapCastingTypes({ enableMagic: 1, enableMiracle: 0 })).toEqual(["sorcery"]);
    expect(mapCastingTypes({ enableMagic: 0, enableMiracle: 1 })).toEqual(["incantation"]);
    expect(mapCastingTypes({ enableMagic: 1, enableMiracle: 1 })).toEqual([
      "sorcery", "incantation",
    ]);
  });
});

describe("getWeaponAffinity", () => {
  it.each([
    [2000000, "standard"],
    [2000100, "heavy"],
    [2000800, "magic"],
    [2001200, "occult"],
  ] as const)("maps source ID %s to %s", (sourceId, affinity) => {
    expect(getWeaponAffinity(2000000, row(sourceId, 2000000, 1, "Longsword"))).toBe(affinity);
  });

  it("rejects non-affinity internal offsets", () => {
    expect(() =>
      getWeaponAffinity(2000000, row(99000000, 2000000, 1, "Internal")),
    ).toThrow("Unsupported affinity offset");
  });
});

function row(
  ID: number,
  originEquipWep: number,
  weaponCategory: number,
  Name: string,
  wepType = 3,
) {
  return { ID, originEquipWep, weaponCategory, Name, wepType } as WeaponParamRow;
}
