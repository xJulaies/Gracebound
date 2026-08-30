import { describe, expect, it } from "vitest";
import type { CalcCorrectGraphRow } from "../schemas/weaponParam.schema";
import { mapCharacterProtectionCurves } from "./mapCharacterProtectionCurves";

describe("mapCharacterProtectionCurves", () => {
  it("requires every defense and status graph", () => {
    expect(() => mapCharacterProtectionCurves([])).toThrow("Missing CalcCorrectGraph 102");
  });

  it("preserves fractional curve values until the final calculation", () => {
    const rows = requiredRows();
    const curves = mapCharacterProtectionCurves(rows);
    expect(curves.levelDefense[80]).toBeCloseTo(71.812, 3);
    expect(curves.statusLevel.poison[80]).toBeCloseTo(90.906, 3);
  });
});

function requiredRows() {
  const rows = [
    graph(102, [1, 150, 170, 240, 792], [40, 100, 120, 135, 155]),
    graph(130, [0, 30, 40, 60, 99], [0, 10, 15, 30, 40]),
    graph(132, [0, 20, 35, 60, 99], [0, 40, 50, 60, 70]),
    graph(133, [0, 30, 40, 60, 99], [0, 20, 40, 60, 70]),
    graph(135, [0, 20, 35, 60, 99], [0, 40, 50, 60, 70]),
    graph(140, [0, 30, 40, 60, 99], [1, 1.3, 1.4, 1.6, 1.99]),
  ];
  for (let id = 110; id <= 116; id += 1) rows.push(graph(id, [1, 150, 190, 240, 792], [75, 105, 145, 160, 180]));
  for (let id = 120; id <= 125; id += 1) rows.push(graph(id, [0, 30, 40, 60, 99], [0, 0, 30, 40, 50]));
  rows.push(graph(126, [0, 15, 40, 60, 99], [0, 15, 30, 40, 50]));
  return rows;
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
