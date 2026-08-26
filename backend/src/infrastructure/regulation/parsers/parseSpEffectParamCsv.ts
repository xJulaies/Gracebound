import { parse } from "csv-parse/sync";
import { z } from "zod";
import {
  spEffectParamRowSchema,
  type SpEffectParamRow,
} from "../schemas/spEffectParam.schema";

const spEffectParamRowsSchema = z.array(spEffectParamRowSchema).min(1);

export function parseSpEffectParamCsv(csv: string): SpEffectParamRow[] {
  const rows: unknown = parse(csv, {
    bom: true,
    columns: (header) =>
      header[header.length - 1] === "" ? header.slice(0, -1) : header,
    skip_empty_lines: true,
  });

  return spEffectParamRowsSchema.parse(rows);
}
