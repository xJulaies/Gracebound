import { describe, expect, it } from "vitest";
import { parseEquipmentCatalogSearch } from "./parseEquipmentCatalogSearch";

describe("parseEquipmentCatalogSearch", () => {
  it("accepts supported shareable filters", () => {
    expect(parseEquipmentCatalogSearch({
      category: "talismans",
      search: "claw",
      talismanStatus: "supported",
    })).toEqual({
      category: "talismans",
      search: "claw",
      talismanStatus: "supported",
    });
  });

  it("replaces invalid search values with safe defaults", () => {
    expect(parseEquipmentCatalogSearch({
      category: "spells",
      search: 42,
      armorSlot: "shield",
      weaponType: "not valid",
    })).toEqual({ category: "all", search: "" });
  });
});
