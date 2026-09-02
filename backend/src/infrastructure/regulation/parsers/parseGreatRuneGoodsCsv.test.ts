import { describe, expect, it } from "vitest";
import { parseGreatRuneGoodsCsv } from "./parseGreatRuneGoodsCsv";

describe("parseGreatRuneGoodsCsv", () => {
  it("keeps the Great Rune catalog fields", () => {
    expect(parseGreatRuneGoodsCsv(
      "ID,Name,iconId,goodsType,ignored\n191,Godrick's Great Rune,3201,15,value\n",
    )).toEqual([{ ID: 191, Name: "Godrick's Great Rune", iconId: 3201, goodsType: 15 }]);
  });
});
