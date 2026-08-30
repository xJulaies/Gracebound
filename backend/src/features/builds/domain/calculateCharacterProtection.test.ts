import { describe, expect, it } from "vitest";
import { mapCharacterProtectionCurves } from "../../../infrastructure/regulation/mappers/mapCharacterProtectionCurves";
import type { CalcCorrectGraphRow } from "../../../infrastructure/regulation/schemas/weaponParam.schema";
import { calculateCharacterProtection } from "./calculateCharacterProtection";

describe("calculateCharacterProtection", () => {
  it("reproduces the naked level-one Wretch status screen", () => {
    const curves = mapCharacterProtectionCurves(rows());
    const result = calculateCharacterProtection(1, {
      vigor: 10, mind: 10, endurance: 10, strength: 10,
      dexterity: 10, intelligence: 10, faith: 10, arcane: 10,
    }, { ...curves, maxHp: [], maxFp: [], maxStamina: [], maxEquipLoad: [] });

    expect(result.defenses).toEqual({ physical: 75, magic: 91, fire: 78, lightning: 71, holy: 91 });
    expect(result.itemDiscovery).toBe(110);
    expect(result.statusResistances).toEqual({
      poison: 90, rot: 90, bleed: 90, frost: 90,
      sleep: 90, madness: 90, deathBlight: 100,
    });
  });
});

function rows() {
  const definitions: Array<[number, number[], number[]]> = [
    [102, [1, 150, 170, 240, 792], [40, 100, 120, 135, 155]],
    [130, [0, 30, 40, 60, 99], [0, 10, 15, 30, 40]],
    [132, [0, 20, 35, 60, 99], [0, 40, 50, 60, 70]],
    [133, [0, 30, 40, 60, 99], [0, 20, 40, 60, 70]],
    [135, [0, 20, 35, 60, 99], [0, 40, 50, 60, 70]],
    [140, [0, 30, 40, 60, 99], [1, 1.3, 1.4, 1.6, 1.99]],
  ];
  for (let id = 110; id <= 116; id += 1) definitions.push([id, [1, 150, 190, 240, 792], [75, 105, 145, 160, 180]]);
  for (let id = 120; id <= 125; id += 1) definitions.push([id, [0, 30, 40, 60, 99], [0, 0, 30, 40, 50]]);
  definitions.push([126, [0, 15, 40, 60, 99], [0, 15, 30, 40, 50]]);
  return definitions.map(([id, stages, growth]) => graph(id, stages, growth));
}

function graph(id: number, stages: number[], growth: number[]): CalcCorrectGraphRow {
  const row: CalcCorrectGraphRow = { ID: id, Name: `Graph ${id}` };
  for (let index = 0; index < 5; index += 1) {
    row[`stageMaxVal${index}`] = stages[index]!;
    row[`stageMaxGrowVal${index}`] = growth[index]!;
    row[`adjPt_maxGrowVal${index}`] = 1;
  }
  return row;
}
