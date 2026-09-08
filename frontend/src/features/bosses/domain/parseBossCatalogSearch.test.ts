import { describe, expect, it } from "vitest";
import { parseBossCatalogSearch } from "./parseBossCatalogSearch";

describe("parseBossCatalogSearch", () => {
  it("keeps supported URL filters", () => {
    expect(parseBossCatalogSearch({
      search: "dragon",
      region: "caelid",
      locationType: "open-world",
      rank: "major",
      progression: "optional",
      rewardsGreatRune: "true",
    })).toEqual({
      search: "dragon",
      region: "caelid",
      locationType: "open-world",
      rank: "major",
      progression: "optional",
      rewardsGreatRune: true,
    });
  });

  it("discards unsupported filters", () => {
    expect(parseBossCatalogSearch({
      region: "lands-between",
      rank: "legendary",
      rewardsGreatRune: "false",
    })).toEqual({ search: "" });
  });
});
