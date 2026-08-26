import { parse } from "csv-parse/sync";
import { z } from "zod";
import {
  npcParamRowSchema,
  type NpcParamRow,
} from "../schemas/npcParam.schema";

const npcParamRowsSchema = z.array(npcParamRowSchema).min(1);

export function parseNpcParamCsv(csv: string): NpcParamRow[] {
  const rows: unknown = parse(csv, {
    bom: true,
    columns: (header) =>
      header[header.length - 1] === "" ? header.slice(0, -1) : header,
    skip_empty_lines: true,
  });

  return npcParamRowsSchema.parse(rows);
}
