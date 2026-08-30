import { describe, expect, it } from "vitest";
import type { CalcCorrectGraphRow } from "../schemas/weaponParam.schema";
import { mapCharacterResourceCurves } from "./mapCharacterResourceCurves";

describe("mapCharacterResourceCurves", () => {
  it("expands Regulation 1.17 resource graphs into exact attribute lookups", () => {
    const curves = mapCharacterResourceCurves([
      graph(100, [1, 25, 40, 60, 99], [300, 800, 1450, 1900, 2100], [1.5, 1.1, -1.2, -1.2, 1]),
      graph(101, [1, 15, 35, 60, 99], [50, 95, 200, 350, 450], [1, 1, -1.2, 1, 1]),
      graph(104, [1, 15, 30, 50, 99], [80, 105, 130, 155, 170], [1, 1, 1, 1, 1]),
      graph(220, [1, 8, 25, 60, 99], [45, 45, 72, 120, 160], [1, 1, 1.1, 1, 1]),
    ]);

    expect([curves.maxHp[1], curves.maxHp[10], curves.maxHp[40], curves.maxHp[60], curves.maxHp[99]])
      .toEqual([300, 414, 1450, 1900, 2100]);
    expect([curves.maxFp[1], curves.maxFp[30], curves.maxFp[99]])
      .toEqual([50, 173, 450]);
    expect([curves.maxStamina[1], curves.maxStamina[30], curves.maxStamina[99]])
      .toEqual([80, 130, 170]);
    expect([curves.maxEquipLoad[1], curves.maxEquipLoad[25], curves.maxEquipLoad[99]])
      .toEqual([45, 72, 160]);
  });

  it("rejects incomplete source data", () => {
    expect(() => mapCharacterResourceCurves([])).toThrow("Missing CalcCorrectGraph 100");
  });
});

function graph(id: number, stages: number[], growth: number[], adjustment: number[]): CalcCorrectGraphRow {
  const row: CalcCorrectGraphRow = { ID: id, Name: `Graph ${id}` };
  for (let index = 0; index < 5; index += 1) {
    row[`stageMaxVal${index}`] = stages[index]!;
    row[`stageMaxGrowVal${index}`] = growth[index]!;
    row[`adjPt_maxGrowVal${index}`] = adjustment[index]!;
  }
  return row;
}
