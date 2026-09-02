import { parse } from "csv-parse/sync";
import { greatRuneGoodsRowSchema } from "../schemas/greatRune.schema";

export function parseGreatRuneGoodsCsv(csv: string) {
  return greatRuneGoodsRowSchema.array().parse(parse(csv, {
    bom: true,
    columns: (header: string[]) => header[header.length - 1] === "" ? header.slice(0, -1) : header,
    relax_quotes: true,
    skip_empty_lines: true,
  }));
}
