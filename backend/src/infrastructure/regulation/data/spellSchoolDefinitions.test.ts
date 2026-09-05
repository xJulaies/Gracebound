import { describe, expect, it } from "vitest";
import {
  findSpellSchools,
  getClassifiedSpellCount,
} from "./spellSchoolDefinitions";

describe("spell school definitions", () => {
  it("classifies every base-game spell in the current catalog", () => {
    expect(getClassifiedSpellCount()).toBe(171);
  });

  it("keeps representative sorcery and incantation families explicit", () => {
    expect(findSpellSchools(4720)).toEqual(["gravity"]);
    expect(findSpellSchools(7320)).toEqual(["frenzied-flame"]);
    expect(findSpellSchools(7000)).toEqual(["dragon-communion"]);
    expect(findSpellSchools(6700)).toEqual(["golden-order"]);
  });

  it("supports meaningful overlapping schools", () => {
    expect(findSpellSchools(4361)).toEqual(["full-moon", "cold"]);
    expect(findSpellSchools(4431)).toEqual(["carian", "cold"]);
  });

  it("does not guess a school for an unknown Magic ID", () => {
    expect(findSpellSchools(999_999)).toEqual([]);
  });
});
