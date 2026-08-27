import { parse } from "csv-parse/sync";
import { z } from "zod";
import {
  attackElementCorrectRowSchema,
  calcCorrectGraphRowSchema,
  reinforceWeaponRowSchema,
  weaponParamRowSchema,
  type AttackElementCorrectRow,
  type CalcCorrectGraphRow,
  type ReinforceWeaponRow,
  type WeaponParamRow,
} from "../schemas/weaponParam.schema";

export const parseWeaponParamCsv = (csv: string): WeaponParamRow[] =>
  parseRows(csv, weaponParamRowSchema);

export const parseReinforceWeaponCsv = (csv: string): ReinforceWeaponRow[] =>
  parseRows(csv, reinforceWeaponRowSchema);

export const parseAttackElementCorrectCsv = (
  csv: string,
): AttackElementCorrectRow[] => parseRows(csv, attackElementCorrectRowSchema);

export const parseCalcCorrectGraphCsv = (
  csv: string,
): CalcCorrectGraphRow[] => parseRows(csv, calcCorrectGraphRowSchema);

function parseRows<T>(csv: string, schema: z.ZodType<T>): T[] {
  const rows: unknown = parse(csv, {
    bom: true,
    columns: (header) =>
      header[header.length - 1] === "" ? header.slice(0, -1) : header,
    skip_empty_lines: true,
  });

  return z.array(schema).min(1).parse(rows);
}
