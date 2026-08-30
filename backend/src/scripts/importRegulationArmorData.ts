import { createHash } from "node:crypto";
import { createReadStream } from "node:fs";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { settings } from "../config/settings";
import { connectMongoDB, disconnectMongoDB } from "../db";
import { mapBaseGameArmor } from "../infrastructure/regulation/mappers/mapRegulationArmor";
import { parseArmorParamCsv } from "../infrastructure/regulation/parsers/parseArmorParamCsv";
import { saveArmorCatalog } from "../infrastructure/regulation/services/saveArmorCatalog";

async function importRegulationArmorData() {
  const exportDirectory = requiredArgument("--exports");
  const regulationFile = requiredArgument("--regulation");
  const [csv, sourceHash] = await Promise.all([
    readFile(path.join(exportDirectory, "EquipParamProtector.csv"), "utf8"),
    sha256(regulationFile),
  ]);
  const armor = mapBaseGameArmor(parseArmorParamCsv(csv));
  if (settings.SUPPORTED_GAME_VERSION === "1.17.0" && armor.length !== 587) {
    throw new Error(`Incomplete 1.17.0 armor catalog: expected 587, mapped ${armor.length}`);
  }
  console.log(`Validated ${armor.length} base-game armor pieces`);
  if (process.argv.includes("--dry-run")) {
    console.log("Dry run complete; MongoDB was not changed");
    return;
  }
  try {
    await connectMongoDB();
    const summary = await saveArmorCatalog(armor, { gameVersion: settings.SUPPORTED_GAME_VERSION, sourceHash });
    console.log(`Imported game version ${summary.gameVersion}: ${summary.armor} armor pieces`);
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

void importRegulationArmorData().catch((error: unknown) => {
  console.error(`Regulation armor import failed: ${error instanceof Error ? error.message : "Unknown error"}`);
  process.exitCode = 1;
});
