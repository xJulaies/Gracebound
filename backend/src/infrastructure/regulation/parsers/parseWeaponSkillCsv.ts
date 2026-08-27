import { parse } from "csv-parse/sync";
import { z } from "zod";
import {
  bulletParamRowSchema,
  equipParamGemRowSchema,
  finalDamageRateRowSchema,
  swordArtsParamRowSchema,
  type BulletParamRow,
  type EquipParamGemRow,
  type FinalDamageRateRow,
  type SwordArtsParamRow,
} from "../schemas/weaponSkillParam.schema";

export const parseBulletParamCsv = (csv: string): BulletParamRow[] =>
  parseRows(csv, bulletParamRowSchema);
export const parseSwordArtsParamCsv = (csv: string): SwordArtsParamRow[] =>
  parseRows(csv, swordArtsParamRowSchema);
export const parseEquipParamGemCsv = (csv: string): EquipParamGemRow[] =>
  parseRows(csv, equipParamGemRowSchema);
export const parseFinalDamageRateCsv = (csv: string): FinalDamageRateRow[] =>
  parseRows(csv, finalDamageRateRowSchema);

function parseRows<T>(csv: string, schema: z.ZodType<T>): T[] {
  const rows: unknown = parse(csv, {
    bom: true,
    columns: (header) =>
      header[header.length - 1] === "" ? header.slice(0, -1) : header,
    relax_quotes: true,
    skip_empty_lines: true,
  });
  return z.array(schema).min(1).parse(rows);
}
