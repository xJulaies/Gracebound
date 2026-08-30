import type { CharacterProgressionCurves, CharacterResourceCurves } from "../../../features/builds/domain/characterResources.types";
import type { CalcCorrectGraphRow } from "../schemas/weaponParam.schema";

const GRAPH_IDS = {
  levelDefense: 102,
  physicalDefense: 130,
  magicDefense: 132,
  fireDefense: 133,
  holyDefense: 135,
  itemDiscovery: 140,
} as const;

const STATUS_LEVEL_IDS = { poison: 110, rot: 111, bleed: 112, frost: 113, sleep: 114, madness: 115, deathBlight: 116 } as const;
const STATUS_ATTRIBUTE_IDS = { poison: 120, rot: 121, bleed: 122, frost: 123, sleep: 124, madness: 125, deathBlight: 126 } as const;

export function mapCharacterProtectionCurves(
  rows: CalcCorrectGraphRow[],
): Omit<CharacterProgressionCurves, keyof CharacterResourceCurves> {
  return {
    ...mapGroup(rows, GRAPH_IDS),
    statusLevel: mapGroup(rows, STATUS_LEVEL_IDS),
    statusAttribute: mapGroup(rows, STATUS_ATTRIBUTE_IDS),
  };
}

function mapGroup<T extends Record<string, number>>(rows: CalcCorrectGraphRow[], ids: T) {
  return Object.fromEntries(Object.entries(ids).map(([name, id]) => {
    const row = rows.find((candidate) => candidate.ID === id);
    if (!row) throw new Error(`Missing CalcCorrectGraph ${id} for ${name}`);
    return [name, expandCurve(row)];
  })) as { [K in keyof T]: number[] };
}

function expandCurve(row: CalcCorrectGraphRow) {
  const values = Array<number>(793).fill(0);
  for (let stage = 0; stage < 4; stage += 1) {
    const left = numberField(row, `stageMaxVal${stage}`);
    const right = numberField(row, `stageMaxVal${stage + 1}`);
    const min = numberField(row, `stageMaxGrowVal${stage}`);
    const max = numberField(row, `stageMaxGrowVal${stage + 1}`);
    const adjustment = numberField(row, `adjPt_maxGrowVal${stage}`);
    for (let value = left; value <= right; value += 1) {
      const ratio = (value - left) / (right - left);
      const growth = adjustment > 0 ? ratio ** adjustment : 1 - (1 - ratio) ** Math.abs(adjustment);
      values[value] = min + (max - min) * growth;
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
