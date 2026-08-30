import { parse } from "csv-parse/sync";
import { z } from "zod";
import { talismanParamRowSchema, type TalismanParamRow } from "../schemas/talismanParam.schema";

export function parseTalismanParamCsv(csv: string): TalismanParamRow[] {
  const rows: unknown = parse(csv, {
    bom: true,
    columns: (header) => header[header.length - 1] === "" ? header.slice(0, -1) : header,
    relax_quotes: true,
    skip_empty_lines: true,
  });
  return z.array(talismanParamRowSchema).min(1).parse(rows);
}
