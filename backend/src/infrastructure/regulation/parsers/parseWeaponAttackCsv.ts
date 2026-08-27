import { parse } from "csv-parse/sync";
import { z } from "zod";
import {
  attackParamRowSchema,
  behaviorParamRowSchema,
  type AttackParamRow,
  type BehaviorParamRow,
} from "../schemas/weaponAttackParam.schema";

export function parseBehaviorParamCsv(csv: string): BehaviorParamRow[] {
  return parseRows(csv, behaviorParamRowSchema);
}

export function parseAttackParamCsv(csv: string): AttackParamRow[] {
  return parseRows(csv, attackParamRowSchema);
}

function parseRows<T>(csv: string, schema: z.ZodType<T>): T[] {
  const rows: unknown = parse(csv, {
    bom: true,
    columns: (header) =>
      header[header.length - 1] === "" ? header.slice(0, -1) : header,
    skip_empty_lines: true,
  });

  return z.array(schema).min(1).parse(rows);
}
