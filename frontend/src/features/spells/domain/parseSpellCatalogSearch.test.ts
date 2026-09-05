import { describe, expect, it } from "vitest";
import { parseSpellCatalogSearch } from "./parseSpellCatalogSearch";

describe("parseSpellCatalogSearch", () => {
  it("keeps valid URL filters", () => {
    expect(parseSpellCatalogSearch({
      type: "sorcery",
      school: "gravity",
      search: "well",
    })).toEqual({ type: "sorcery", school: "gravity", search: "well" });
  });

  it("drops schools until a spell type is selected", () => {
    expect(parseSpellCatalogSearch({ type: "all", school: "gravity" }))
      .toEqual({ type: "all", search: "" });
  });

  it("drops a school that does not belong to the selected type", () => {
    expect(parseSpellCatalogSearch({ type: "sorcery", school: "frenzied-flame" }))
      .toEqual({ type: "sorcery", search: "" });
  });

  it("uses safe defaults for invalid values", () => {
    expect(parseSpellCatalogSearch({ type: "weapon", school: "unknown" }))
      .toEqual({ type: "all", search: "" });
  });
});
