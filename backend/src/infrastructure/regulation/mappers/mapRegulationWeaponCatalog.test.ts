import { describe, expect, it } from "vitest";
import type { WeaponParamRow } from "../schemas/weaponParam.schema";
import {
  getWeaponAffinity,
  isCanonicalPlayerWeapon,
  mapCastingTypes,
} from "./mapRegulationWeaponCatalog";

describe("isCanonicalPlayerWeapon", () => {
  it("includes self-referencing player armaments including fist weapons", () => {
    expect(isCanonicalPlayerWeapon(row(21000000, 21000000, 9, "Caestus"))).toBe(true);
  });

  it("excludes affinity, NPC, unnamed, and non-weapon rows", () => {
    expect(isCanonicalPlayerWeapon(row(2000100, 2000000, 1, "Heavy Longsword"))).toBe(false);
    expect(isCanonicalPlayerWeapon(row(2092000, 2090000, 1, "[NPC] Inseparable Sword"))).toBe(false);
    expect(isCanonicalPlayerWeapon(row(1000, 1000, 1, ""))).toBe(false);
    expect(isCanonicalPlayerWeapon(row(170000, 170000, 0, "Throwing Dagger"))).toBe(false);
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

function row(ID: number, originEquipWep: number, weaponCategory: number, Name: string) {
  return { ID, originEquipWep, weaponCategory, Name } as WeaponParamRow;
}
