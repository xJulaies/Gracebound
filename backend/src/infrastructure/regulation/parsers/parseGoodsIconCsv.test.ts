import { describe, expect, it } from "vitest";
import { parseGoodsIconCsv } from "./parseGoodsIconCsv";

describe("parseGoodsIconCsv", () => {
  it("keeps only the fields required for spell icon mapping", () => {
    expect(parseGoodsIconCsv("ID,Name,iconId\n4000,[Sorcery] Glintstone Pebble,6000\n")).toEqual([
      { ID: 4000, iconId: 6000 },
    ]);
  });
});
