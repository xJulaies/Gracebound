import { describe, expect, it } from "vitest";
import { parseNpcParamCsv } from "./parseNpcParamCsv";

const header = [
  "ID",
  "Name",
  "hp",
  "def_phys",
  "def_slash",
  "def_blow",
  "def_thrust",
  "def_mag",
  "def_fire",
  "def_thunder",
  "def_dark",
  "neutralDamageCutRate",
  "slashDamageCutRate",
  "blowDamageCutRate",
  "thrustDamageCutRate",
  "magicDamageCutRate",
  "fireDamageCutRate",
  "thunderDamageCutRate",
  "darkDamageCutRate",
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
      "21300014,\"Margit- the Fell Omen\",2521,100,0,0,0,100,100,100,100,1,1.1,1,1,1,1,1,0.6,5402,0,5360,7030,0,90400,0,0",
    ].join("\n");

    expect(parseNpcParamCsv(csv)).toEqual([
      {
        ID: 21300014,
        Name: "Margit- the Fell Omen",
        hp: 2521,
        def_phys: 100,
        def_slash: 0,
        def_blow: 0,
        def_thrust: 0,
        def_mag: 100,
        def_fire: 100,
        def_thunder: 100,
        def_dark: 100,
        neutralDamageCutRate: 1,
        slashDamageCutRate: 1.1,
        blowDamageCutRate: 1,
        thrustDamageCutRate: 1,
        magicDamageCutRate: 1,
        fireDamageCutRate: 1,
        thunderDamageCutRate: 1,
        darkDamageCutRate: 0.6,
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
      "21300014,\"Margit- the Fell Omen\",unknown,100,0,0,0,100,100,100,100,1,1.1,1,1,1,1,1,0.6,5402,0,5360,7030,0,90400,0,0",
    ].join("\n");

    expect(() => parseNpcParamCsv(csv)).toThrow();
  });
});
