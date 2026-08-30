import { parse } from "csv-parse/sync";
import { z } from "zod";
import { talismanEffectParamRowSchema, type TalismanEffectParamRow } from "../schemas/talismanEffectParam.schema";

export function parseTalismanEffectParamCsv(csv: string): TalismanEffectParamRow[] {
  const rows: unknown = parse(csv, {
    bom: true,
    columns: (header) => header[header.length - 1] === "" ? header.slice(0, -1) : header,
    relax_quotes: true,
    skip_empty_lines: true,
  });
  return z.array(talismanEffectParamRowSchema).min(1).parse(rows);
}
