import { parse } from "csv-parse/sync";
import {
  characterInitialStatsRowSchema,
  classSelectionRowSchema,
} from "../schemas/characterClass.schema";

export function parseClassSelectionCsv(csv: string) {
  return classSelectionRowSchema.array().parse(parse(csv, {
    bom: true,
    columns: normalizeSmithboxHeader,
    relax_quotes: true,
    skip_empty_lines: true,
  }));
}

export function parseCharacterInitialStatsCsv(csv: string) {
  return characterInitialStatsRowSchema.array().parse(parse(csv, {
    bom: true,
    columns: normalizeSmithboxHeader,
    relax_quotes: true,
    skip_empty_lines: true,
  }));
}

function normalizeSmithboxHeader(header: string[]) {
  return header[header.length - 1] === "" ? header.slice(0, -1) : header;
}
