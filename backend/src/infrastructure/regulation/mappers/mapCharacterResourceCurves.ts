import type { CharacterResourceCurves } from "../../../features/builds/domain/characterResources.types";
import type { CalcCorrectGraphRow } from "../schemas/weaponParam.schema";

const RESOURCE_GRAPH_IDS = {
  maxHp: 100,
  maxFp: 101,
  maxStamina: 104,
  maxEquipLoad: 220,
} as const;

export function mapCharacterResourceCurves(rows: CalcCorrectGraphRow[]): CharacterResourceCurves {
  return Object.fromEntries(Object.entries(RESOURCE_GRAPH_IDS).map(([name, id]) => {
    const row = rows.find((candidate) => candidate.ID === id);
    if (!row) throw new Error(`Missing CalcCorrectGraph ${id} for ${name}`);
    return [name, expandCurve(row)];
  })) as unknown as CharacterResourceCurves;
}

function expandCurve(row: CalcCorrectGraphRow) {
  const values = Array<number>(100).fill(0);
  for (let stage = 0; stage < 4; stage += 1) {
    const left = numberField(row, `stageMaxVal${stage}`);
    const right = numberField(row, `stageMaxVal${stage + 1}`);
    const min = numberField(row, `stageMaxGrowVal${stage}`);
    const max = numberField(row, `stageMaxGrowVal${stage + 1}`);
    const adjustment = numberField(row, `adjPt_maxGrowVal${stage}`);
    for (let attribute = left; attribute <= Math.min(right, 99); attribute += 1) {
      const ratio = (attribute - left) / (right - left);
      const growth = adjustment > 0
        ? ratio ** adjustment
        : 1 - (1 - ratio) ** Math.abs(adjustment);
      values[attribute] = roundDown(min + (max - min) * growth, row.ID === 220 ? 1 : 0);
    }
  }
  values[0] = values[1]!;
  return values;
}

function numberField(row: CalcCorrectGraphRow, key: string) {
  const value = row[key];
  if (typeof value !== "number") throw new Error(`Missing numeric field ${key}`);
  return value;
}

function roundDown(value: number, decimals: number) {
  const factor = 10 ** decimals;
  return Math.floor((value + Number.EPSILON) * factor) / factor;
}
