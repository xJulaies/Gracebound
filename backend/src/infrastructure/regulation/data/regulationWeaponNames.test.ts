import { describe, expect, it } from "vitest";
import type { WeaponParamRow } from "../schemas/weaponParam.schema";
import { addRegulationWeaponNames } from "./regulationWeaponNames";

describe("addRegulationWeaponNames", () => {
  it("adds the official 1.17 name to a canonical weapon and its affinities", () => {
    const rows = [row(8530000, 8530000), row(8530100, 8530000), row(8530500, 8530000)];

    expect(addRegulationWeaponNames("1.17.0", rows).map(({ Name }) => Name)).toEqual([
      "Hefty Scimitar",
      "Heavy Hefty Scimitar",
      "Flame Art Hefty Scimitar",
    ]);
  });

  it("keeps existing names and unknown internal rows unchanged", () => {
    const named = row(2000000, 2000000, "Longsword");
    const internal = row(3910000, 3910000);

    expect(addRegulationWeaponNames("1.17.0", [named, internal])).toEqual([
      named,
      internal,
    ]);
  });

  it("does not apply names to a different game version", () => {
    const source = row(8530000, 8530000);
    expect(addRegulationWeaponNames("1.16.1", [source])).toEqual([source]);
  });
});

function row(ID: number, originEquipWep: number, Name = "") {
  return { ID, originEquipWep, Name } as WeaponParamRow;
}
