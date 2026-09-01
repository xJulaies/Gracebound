import { describe, expect, it } from "vitest";
import { parseMagicParamCsv } from "./parseMagicParamCsv";

describe("parseMagicParamCsv", () => {
  it("parses and validates required Magic fields", () => {
    const csv = "ID,Name,mp,slotLength,requirementIntellect,requirementFaith,requirementLuck,iconId\n4000,[Sorcery] Glintstone Pebble,7,1,10,0,0,4000\n";
    expect(parseMagicParamCsv(csv)).toEqual([{
      ID: 4000, Name: "[Sorcery] Glintstone Pebble", mp: 7, slotLength: 1,
      requirementIntellect: 10, requirementFaith: 0, requirementLuck: 0, iconId: 4000,
      refCategory1: 0, refId1: -1,
      refCategory2: 0, refId2: -1, mp_charge: 0,
    }]);
  });

  it("rejects invalid costs and slot counts", () => {
    const csv = "ID,Name,mp,slotLength,requirementIntellect,requirementFaith,requirementLuck,iconId\n4000,[Sorcery] Invalid,-1,-1,10,0,0,4000\n";
    expect(() => parseMagicParamCsv(csv)).toThrow();
  });
});
