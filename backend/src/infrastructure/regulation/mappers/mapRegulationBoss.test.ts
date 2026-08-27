import { describe, expect, it } from "vitest";
import type { NpcParamRow } from "../schemas/npcParam.schema";
import type { SpEffectParamRow } from "../schemas/spEffectParam.schema";
import {
  mapRegulationBoss,
  type RegulationBossDefinition,
} from "./mapRegulationBoss";

const margitDefinition: RegulationBossDefinition = {
  id: "margit-the-fell-omen",
  name: "Margit, the Fell Omen",
  npcParamId: 21300014,
};

const margitNpc: NpcParamRow = {
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
};

const stormveilScaling: SpEffectParamRow = {
  ID: 7030,
  Name: "Area Scaling - Tier 04 (Stormveil Castle)",
  maxHpRate: 1.656,
  physicsDiffenceRate: 1.039,
  magicDiffenceRate: 1.039,
  fireDiffenceRate: 1.039,
  thunderDiffenceRate: 1.039,
  darkDiffenceRate: 1.039,
};

describe("mapRegulationBoss", () => {
  it("maps Margit from linked NPC and scaling data", () => {
    expect(
      mapRegulationBoss(
        margitDefinition,
        [margitNpc],
        [stormveilScaling],
      ),
    ).toEqual({
      id: "margit-the-fell-omen",
      name: "Margit, the Fell Omen",
      health: 4174,
      defense: {
        physical: 103,
        magic: 103,
        fire: 103,
        lightning: 103,
        holy: 103,
      },
      absorption: {
        physical: { standard: 0, slash: -10, strike: 0, pierce: 0 },
        magic: 0,
        fire: 0,
        lightning: 0,
        holy: 40,
      },
      sourceNpcId: 21300014,
      healthScalingEffectId: 7030,
    });
  });

  it("rejects an unknown NPC reference", () => {
    expect(() =>
      mapRegulationBoss(margitDefinition, [], [stormveilScaling]),
    ).toThrow("Unknown NpcParam 21300014");
  });

  it("rejects an unknown health-scaling effect reference", () => {
    expect(() =>
      mapRegulationBoss(margitDefinition, [margitNpc], []),
    ).toThrow("Unknown SpEffectParam 7030 for Margit, the Fell Omen");
  });
});
