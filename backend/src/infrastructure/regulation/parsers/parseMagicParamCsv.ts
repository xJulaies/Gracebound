import { parse } from "csv-parse/sync";
import { magicParamRowSchema } from "../schemas/magic.schema";

export function parseMagicParamCsv(csv: string) {
  return magicParamRowSchema.array().parse(parse(csv, {
    bom: true,
    columns: (header: string[]) => header[header.length - 1] === "" ? header.slice(0, -1) : header,
    relax_quotes: true,
    skip_empty_lines: true,
  }));
}
