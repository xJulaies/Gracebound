import { parse } from "csv-parse/sync";
import { armorBehaviorRowSchema, armorBulletRowSchema, armorEffectRowSchema, armorParamRowSchema } from "../schemas/armor.schema";

export function parseArmorParamCsv(csv: string) {
  return armorParamRowSchema.array().parse(parse(csv, {
    bom: true,
    columns: (header: string[]) => header[header.length - 1] === "" ? header.slice(0, -1) : header,
    relax_quotes: true,
    skip_empty_lines: true,
  }));
}

export function parseArmorEffectCsv(csv: string) {
  return armorEffectRowSchema.array().parse(parse(csv, {
    bom: true,
    columns: (header: string[]) => header[header.length - 1] === "" ? header.slice(0, -1) : header,
    relax_quotes: true,
    skip_empty_lines: true,
  }));
}

export function parseArmorBehaviorCsv(csv: string) {
  return armorBehaviorRowSchema.array().parse(parseCsv(csv));
}

export function parseArmorBulletCsv(csv: string) {
  return armorBulletRowSchema.array().parse(parseCsv(csv));
}

function parseCsv(csv: string) {
  return parse(csv, {
    bom: true,
    columns: (header: string[]) => header[header.length - 1] === "" ? header.slice(0, -1) : header,
    relax_quotes: true,
    skip_empty_lines: true,
  });
}
