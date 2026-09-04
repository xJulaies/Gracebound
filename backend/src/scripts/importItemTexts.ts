import { readFile } from "node:fs/promises";
import path from "node:path";
import { settings } from "../config/settings";
import { connectMongoDB, disconnectMongoDB } from "../db";
import { importItemTexts } from "../infrastructure/texts/importItemTexts";
import { parseSmithboxTextExport } from "../infrastructure/texts/parseSmithboxTextExport";

async function run() {
  const filename = requiredArgument("--texts");
  const catalogs = parseSmithboxTextExport(await readFile(filename, "utf8"));
  const dryRun = process.argv.includes("--dry-run");

  try {
    await connectMongoDB();
    const results = await importItemTexts(
      catalogs,
      settings.SUPPORTED_GAME_VERSION,
      dryRun,
    );
    for (const result of results) {
      console.log(
        `${result.collection}: ${result.matched}/${result.records} matched, ${result.withSummary} summaries, ${result.withDescription} descriptions`,
      );
    }
    console.log(dryRun ? "Dry run complete; MongoDB was not changed" : "Item text import complete");
  } finally {
    await disconnectMongoDB();
  }
}

function requiredArgument(name: string): string {
  const index = process.argv.indexOf(name);
  const value = process.argv[index + 1];
  if (index === -1 || !value || value.startsWith("--")) {
    throw new Error(`Missing required argument ${name}`);
  }
  return path.resolve(value);
}

void run().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : "Unknown error";
  console.error(`Item text import failed: ${message}`);
  process.exitCode = 1;
});
