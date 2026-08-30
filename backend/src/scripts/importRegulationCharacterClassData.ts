import { createHash } from "node:crypto";
import { createReadStream } from "node:fs";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { settings } from "../config/settings";
import { connectMongoDB, disconnectMongoDB } from "../db";
import { mapRegulationCharacterClasses } from "../infrastructure/regulation/mappers/mapRegulationCharacterClasses";
import { parseCharacterInitialStatsCsv, parseClassSelectionCsv } from "../infrastructure/regulation/parsers/parseCharacterClassCsv";
import { saveCharacterClassCatalog } from "../infrastructure/regulation/services/saveCharacterClassCatalog";
import { parseCalcCorrectGraphCsv } from "../infrastructure/regulation/parsers/parseWeaponCsv";
import { mapCharacterResourceCurves } from "../infrastructure/regulation/mappers/mapCharacterResourceCurves";
import { mapCharacterProtectionCurves } from "../infrastructure/regulation/mappers/mapCharacterProtectionCurves";

async function importRegulationCharacterClassData() {
  const exportDirectory = requiredArgument("--exports");
  const regulationFile = requiredArgument("--regulation");
  const [selectionCsv, initialStatsCsv, graphCsv, sourceHash] = await Promise.all([
    readFile(path.join(exportDirectory, "BaseChrSelectMenuParam.csv"), "utf8"),
    readFile(path.join(exportDirectory, "CharaInitParam.csv"), "utf8"),
    readFile(path.join(exportDirectory, "CalcCorrectGraph.csv"), "utf8"),
    sha256(regulationFile),
  ]);
  const classes = mapRegulationCharacterClasses(
    parseClassSelectionCsv(selectionCsv),
    parseCharacterInitialStatsCsv(initialStatsCsv),
  );
  const graphRows = parseCalcCorrectGraphCsv(graphCsv);
  const progressionCurves = {
    ...mapCharacterResourceCurves(graphRows),
    ...mapCharacterProtectionCurves(graphRows),
  };

  console.log(`Validated ${classes.length} character classes`);
  if (process.argv.includes("--dry-run")) {
    console.log("Dry run complete; MongoDB was not changed");
    return;
  }

  try {
    await connectMongoDB();
    const summary = await saveCharacterClassCatalog(classes, progressionCurves, {
      gameVersion: settings.SUPPORTED_GAME_VERSION,
      sourceHash,
    });
    console.log(`Imported game version ${summary.gameVersion}: ${summary.characterClasses} character classes`);
  } finally {
    await disconnectMongoDB();
  }
}

function requiredArgument(name: string): string {
  const index = process.argv.indexOf(name);
  const value = process.argv[index + 1];
  if (index === -1 || !value || value.startsWith("--")) throw new Error(`Missing required argument ${name}`);
  return path.resolve(value);
}

function sha256(filename: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const hash = createHash("sha256");
    const stream = createReadStream(filename);
    stream.on("error", reject);
    stream.on("data", (chunk) => hash.update(chunk));
    stream.on("end", () => resolve(hash.digest("hex")));
  });
}

void importRegulationCharacterClassData().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : "Unknown error";
  console.error(`Regulation character class import failed: ${message}`);
  process.exitCode = 1;
});
