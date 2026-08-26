import { describe, expect, it } from "vitest";
import { parseSpEffectParamCsv } from "./parseSpEffectParamCsv";

const header = "ID,Name,maxHpRate,";

describe("parseSpEffectParamCsv", () => {
  it("parses the Stormveil area-scaling effect", () => {
    const csv = [
      header,
      "7030,\"Area Scaling - Tier 04 (Stormveil Castle)\",1.656",
    ].join("\n");

    expect(parseSpEffectParamCsv(csv)).toEqual([
      {
        ID: 7030,
        Name: "Area Scaling - Tier 04 (Stormveil Castle)",
        maxHpRate: 1.656,
      },
    ]);
  });

  it("rejects a non-positive health multiplier", () => {
    const csv = [header, "7030,Stormveil,0"].join("\n");

    expect(() => parseSpEffectParamCsv(csv)).toThrow();
  });
});
