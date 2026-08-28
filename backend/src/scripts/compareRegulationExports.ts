import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { parse } from "csv-parse/sync";

interface ParamRow {
  ID: string;
  [field: string]: string;
}

async function compareRegulationExports() {
  const beforeDirectory = requiredArgument("--before");
  const afterDirectory = requiredArgument("--after");
  const [beforeFiles, afterFiles] = await Promise.all([
    csvFilenames(beforeDirectory),
    csvFilenames(afterDirectory),
  ]);
  const filenames = [...beforeFiles]
    .filter((filename) => afterFiles.has(filename))
    .sort();

  if (filenames.length === 0) {
    throw new Error("No matching CSV exports found");
  }

  for (const filename of filenames) {
    const [beforeRows, afterRows] = await Promise.all([
      readRows(beforeDirectory, filename),
      readRows(afterDirectory, filename),
    ]);
    printComparison(filename, beforeRows, afterRows);
  }
}

async function csvFilenames(directory: string): Promise<Set<string>> {
  const entries = await readdir(directory, { withFileTypes: true });
  return new Set(
    entries
      .filter((entry) => entry.isFile() && entry.name.endsWith(".csv"))
      .map((entry) => entry.name),
  );
}

async function readRows(directory: string, filename: string) {
  const csv = await readFile(path.join(directory, filename), "utf8");
  return parse(csv, {
    bom: true,
    columns: (header: string[]) =>
      header[header.length - 1] === "" ? header.slice(0, -1) : header,
    relax_quotes: true,
    skip_empty_lines: true,
  }) as ParamRow[];
}

function printComparison(
  filename: string,
  beforeRows: ParamRow[],
  afterRows: ParamRow[],
) {
  const beforeById = indexRows(filename, beforeRows);
  const afterById = indexRows(filename, afterRows);
  const addedIds = [...afterById.keys()].filter((id) => !beforeById.has(id));
  const removedIds = [...beforeById.keys()].filter((id) => !afterById.has(id));
  const changedFields = new Map<string, number>();
  let changedRows = 0;

  for (const [id, before] of beforeById) {
    const after = afterById.get(id);
    if (!after) continue;

    const fields = new Set([...Object.keys(before), ...Object.keys(after)]);
    let rowChanged = false;

    for (const field of fields) {
      if (before[field] !== after[field]) {
        rowChanged = true;
        changedFields.set(field, (changedFields.get(field) ?? 0) + 1);
      }
    }

    if (rowChanged) changedRows += 1;
  }

  const fieldSummary = [...changedFields]
    .sort((left, right) => right[1] - left[1])
    .slice(0, 10)
    .map(([field, count]) => `${field}:${count}`)
    .join(", ");

  console.log(
    `${filename}: ${beforeRows.length} -> ${afterRows.length} rows; +${addedIds.length} -${removedIds.length} ~${changedRows}`,
  );
  if (addedIds.length > 0) console.log(`  added IDs: ${preview(addedIds)}`);
  if (removedIds.length > 0) console.log(`  removed IDs: ${preview(removedIds)}`);
  if (fieldSummary) console.log(`  changed fields: ${fieldSummary}`);
}

function indexRows(filename: string, rows: ParamRow[]): Map<string, ParamRow> {
  const indexed = new Map<string, ParamRow>();

  rows.forEach((row, index) => {
    const id = row.ID ?? String(index);
    if (indexed.has(id)) {
      throw new Error(`${filename} contains duplicate ID ${id}`);
    }
    indexed.set(id, row);
  });

  return indexed;
}

function preview(ids: string[]): string {
  const visible = ids.slice(0, 20).join(", ");
  return ids.length > 20 ? `${visible}, ...` : visible;
}

function requiredArgument(name: string): string {
  const index = process.argv.indexOf(name);
  const value = process.argv[index + 1];

  if (index === -1 || !value || value.startsWith("--")) {
    throw new Error(`Missing required argument ${name}`);
  }

  return path.resolve(value);
}

void compareRegulationExports().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : "Unknown error";
  console.error(`Regulation comparison failed: ${message}`);
  process.exitCode = 1;
});
