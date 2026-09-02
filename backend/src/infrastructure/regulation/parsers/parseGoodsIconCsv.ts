import { parse } from "csv-parse/sync";
import { goodsIconRowSchema } from "../schemas/goodsIcon.schema";

export function parseGoodsIconCsv(csv: string) {
  return goodsIconRowSchema.array().parse(parse(csv, {
    bom: true,
    columns: (header: string[]) => header[header.length - 1] === "" ? header.slice(0, -1) : header,
    relax_quotes: true,
    skip_empty_lines: true,
  }));
}
