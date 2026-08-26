import { describe, expect, it } from "vitest";
import { parseNpcParamCsv } from "./parseNpcParamCsv";

const header = [
  "ID",
  "Name",
  "hp",
  "spEffectID0",
  "spEffectID1",
  "spEffectID2",
  "spEffectID3",
  "spEffectID4",
  "spEffectID5",
  "spEffectID6",
  "spEffectID7",
].join(",") + ",";

describe("parseNpcParamCsv", () => {
  it("parses Margit's base health and area-scaling reference", () => {
    const csv = [
      header,
      "21300014,\"Margit- the Fell Omen\",2521,5402,0,5360,7030,0,90400,0,0",
    ].join("\n");

    expect(parseNpcParamCsv(csv)).toEqual([
      {
        ID: 21300014,
        Name: "Margit- the Fell Omen",
        hp: 2521,
        spEffectID0: 5402,
        spEffectID1: 0,
        spEffectID2: 5360,
        spEffectID3: 7030,
        spEffectID4: 0,
        spEffectID5: 90400,
        spEffectID6: 0,
        spEffectID7: 0,
      },
    ]);
  });

  it("rejects malformed numeric values", () => {
    const csv = [
      header,
      "21300014,\"Margit- the Fell Omen\",unknown,5402,0,5360,7030,0,90400,0,0",
    ].join("\n");

    expect(() => parseNpcParamCsv(csv)).toThrow();
  });
});
