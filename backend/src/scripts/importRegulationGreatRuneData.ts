import { createHash } from "node:crypto";
import { createReadStream } from "node:fs";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { settings } from "../config/settings";
import { connectMongoDB, disconnectMongoDB } from "../db";
import { mapRegulationGreatRunes } from "../infrastructure/regulation/mappers/mapRegulationGreatRunes";
import { parseArmorEffectCsv } from "../infrastructure/regulation/parsers/parseArmorParamCsv";
import { parseGreatRuneGoodsCsv } from "../infrastructure/regulation/parsers/parseGreatRuneGoodsCsv";
import { saveGreatRuneCatalog } from "../infrastructure/regulation/services/saveGreatRuneCatalog";

async function importRegulationGreatRunes() {
  const exportDirectory = requiredArgument("--exports");
  const regulationFile = requiredArgument("--regulation");
  const [goodsCsv, effectsCsv, sourceHash] = await Promise.all([
    readFile(path.join(exportDirectory, "EquipParamGoods.csv"), "utf8"),
    readFile(path.join(exportDirectory, "SpEffectParam.csv"), "utf8"),
    sha256(regulationFile),
  ]);
  const runes = mapRegulationGreatRunes(
    parseGreatRuneGoodsCsv(goodsCsv),
    parseArmorEffectCsv(effectsCsv),
  );
  const supported = runes.filter(({ calculationStatus }) => calculationStatus === "supported").length;
  console.log(`Validated ${runes.length} Great Runes (${supported} supported)`);
  if (process.argv.includes("--dry-run")) {
    console.log("Dry run complete; MongoDB was not changed");
    return;
  }
  try {
    await connectMongoDB();
    const summary = await saveGreatRuneCatalog(runes, {
      gameVersion: settings.SUPPORTED_GAME_VERSION,
      sourceHash,
    });
    console.log(`Imported ${summary.greatRunes} Great Runes for game version ${summary.gameVersion}`);
  } finally {
    await disconnectMongoDB();
  }
}

function requiredArgument(name: string) {
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

void importRegulationGreatRunes().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : "Unknown error";
  console.error(`Great Rune import failed: ${message}`);
  process.exitCode = 1;
});
