import { parse } from "csv-parse/sync";
import { crystalTearGoodsRowSchema } from "../schemas/crystalTear.schema";
export function parseCrystalTearGoodsCsv(csv: string) {
  return crystalTearGoodsRowSchema.array().parse(parse(csv, { bom: true, columns: (header: string[]) => header[header.length - 1] === "" ? header.slice(0, -1) : header, relax_quotes: true, skip_empty_lines: true }));
}
