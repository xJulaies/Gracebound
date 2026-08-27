import { describe, expect, it } from "vitest";
import { mvpBossDefinitions } from "../data/mvpBossDefinitions";
import type { NpcParamRow } from "../schemas/npcParam.schema";
import type { SpEffectParamRow } from "../schemas/spEffectParam.schema";
import { mapRegulationBosses } from "./mapRegulationBoss";

const referenceRows = [
  [21300014, 2521, 7030, 1.656, 4174, 1.039, 103, [0, -10, 0, 0, 0, 0, 0, 40]],
  [47500014, 3354, 7040, 1.813, 6080, 1.053, 105, [0, 0, 0, 0, 20, 20, 20, 40]],
  [20310024, 1703, 7070, 2.406, 4097, 1.093, 109, [-10, -10, 0, -10, 80, 40, 40, 40]],
  [47300040, 2585, 7100, 3.703, 9572, 1.133, 113, [10, 10, 10, 0, 20, 20, 20, 40]],
  [21300534, 2521, 7110, 4.125, 10399, 1.146, 114, [0, -10, 0, 0, 0, 0, 0, 40]],
  [47601050, 6592, 7140, 6.563, 43263, 1.186, 118, [0, -10, 0, 0, 0, 50, 0, 20]],
  [21101072, 1588, 7150, 6.688, 10620, 1.2, 120, [35, 35, 35, 35, 40, 40, 40, 80]],
  [47210070, 3186, 7160, 6.875, 21903, 1.2, 120, [0, -10, 0, 0, 0, 0, 0, 40]],
  [21900078, 1893, 7170, 7.047, 13339, 1.217, 121, [35, 35, 10, 35, 20, 0, 20, 80]],
  [22000078, 3140, 7170, 7.047, 22127, 1.217, 121, [10, 10, 10, 10, 40, 40, 40, 80]],
] as const;

function createNpcRow(
  npcParamId: number,
  baseHealth: number,
  healthScalingEffectId: number,
  absorption = [0, 0, 0, 0, 0, 0, 0, 0] as readonly number[],
): NpcParamRow {
  const damageRate = (value: number) => 1 - value / 100;

  return {
    ID: npcParamId,
    Name: "Source row",
    hp: baseHealth,
    def_phys: 100,
    def_slash: 0,
    def_blow: 0,
    def_thrust: 0,
    def_mag: 100,
    def_fire: 100,
    def_thunder: 100,
    def_dark: 100,
    neutralDamageCutRate: damageRate(absorption[0] ?? 0),
    slashDamageCutRate: damageRate(absorption[1] ?? 0),
    blowDamageCutRate: damageRate(absorption[2] ?? 0),
    thrustDamageCutRate: damageRate(absorption[3] ?? 0),
    magicDamageCutRate: damageRate(absorption[4] ?? 0),
    fireDamageCutRate: damageRate(absorption[5] ?? 0),
    thunderDamageCutRate: damageRate(absorption[6] ?? 0),
    darkDamageCutRate: damageRate(absorption[7] ?? 0),
    spEffectID0: 0,
    spEffectID1: 0,
    spEffectID2: 0,
    spEffectID3: healthScalingEffectId,
    spEffectID4: 0,
    spEffectID5: 0,
    spEffectID6: 0,
    spEffectID7: 0,
  };
}

describe("mapRegulationBosses", () => {
  it("maps every unambiguous MVP boss to its reference health", () => {
    const npcRows = referenceRows.map(([
      npcId,
      health,
      effectId,
      ,
      ,
      ,
      ,
      absorption,
    ]) =>
      createNpcRow(npcId, health, effectId, absorption),
    );
    const effectRows: SpEffectParamRow[] = referenceRows.map(
      ([, , effectId, healthRate, , defenseRate]) => ({
        ID: effectId,
        Name: "Area scaling",
        maxHpRate: healthRate,
        physicsDiffenceRate: defenseRate,
        magicDiffenceRate: defenseRate,
        fireDiffenceRate: defenseRate,
        thunderDiffenceRate: defenseRate,
        darkDiffenceRate: defenseRate,
      }),
    );

    const bosses = mapRegulationBosses(
      mvpBossDefinitions,
      npcRows,
      effectRows,
    );

    expect(bosses).toHaveLength(10);
    expect(bosses.map(({ id, health, defense, absorption }) => ({
      id,
      health,
      defense,
      absorption,
    }))).toEqual(
      mvpBossDefinitions.map((definition, index) => ({
        id: definition.id,
        health: referenceRows[index]?.[4],
        defense: {
          physical: referenceRows[index]?.[6],
          magic: referenceRows[index]?.[6],
          fire: referenceRows[index]?.[6],
          lightning: referenceRows[index]?.[6],
          holy: referenceRows[index]?.[6],
        },
        absorption: {
          physical: {
            standard: referenceRows[index]?.[7][0],
            slash: referenceRows[index]?.[7][1],
            strike: referenceRows[index]?.[7][2],
            pierce: referenceRows[index]?.[7][3],
          },
          magic: referenceRows[index]?.[7][4],
          fire: referenceRows[index]?.[7][5],
          lightning: referenceRows[index]?.[7][6],
          holy: referenceRows[index]?.[7][7],
        },
      })),
    );
  });

  it("uses the Fire Giant health owner instead of adding phase pools", () => {
    const phaseOne = createNpcRow(47600050, 3489, 7140);
    const healthOwner = createNpcRow(47601050, 6592, 7140);
    const areaScaling: SpEffectParamRow = {
      ID: 7140,
      Name: "Area scaling",
      maxHpRate: 6.563,
      physicsDiffenceRate: 1,
      magicDiffenceRate: 1,
      fireDiffenceRate: 1,
      thunderDiffenceRate: 1,
      darkDiffenceRate: 1,
    };
    const fireGiantDefinition = mvpBossDefinitions.find(
      ({ id }) => id === "fire-giant",
    );

    if (!fireGiantDefinition) {
      throw new Error("Missing Fire Giant definition");
    }

    const [fireGiant] = mapRegulationBosses(
      [fireGiantDefinition],
      [phaseOne, healthOwner],
      [areaScaling],
    );

    expect(fireGiant?.health).toBe(43263);
  });
});
