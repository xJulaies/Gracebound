import { describe, expect, it } from "vitest";
import { parseSpEffectParamCsv } from "./parseSpEffectParamCsv";

const header = [
  "ID",
  "Name",
  "maxHpRate",
  "physicsDiffenceRate",
  "magicDiffenceRate",
  "fireDiffenceRate",
  "thunderDiffenceRate",
  "darkDiffenceRate",
].join(",") + ",";

describe("parseSpEffectParamCsv", () => {
  it("parses the Stormveil area-scaling effect", () => {
    const csv = [
      header,
      "7030,\"Area Scaling - Tier 04 (Stormveil Castle)\",1.656,1.039,1.039,1.039,1.039,1.039",
    ].join("\n");

    expect(parseSpEffectParamCsv(csv)).toEqual([
      {
        ID: 7030,
        Name: "Area Scaling - Tier 04 (Stormveil Castle)",
        maxHpRate: 1.656,
        physicsDiffenceRate: 1.039,
        magicDiffenceRate: 1.039,
        fireDiffenceRate: 1.039,
        thunderDiffenceRate: 1.039,
        darkDiffenceRate: 1.039,
      },
    ]);
  });

  it("rejects a non-positive health multiplier", () => {
    const csv = [header, "7030,Stormveil,0,1.039,1.039,1.039,1.039,1.039"].join("\n");

    expect(() => parseSpEffectParamCsv(csv)).toThrow();
  });
});
