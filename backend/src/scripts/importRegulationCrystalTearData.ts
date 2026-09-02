import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { settings } from "../config/settings";
import { connectMongoDB, disconnectMongoDB } from "../db";
import { mapRegulationCrystalTears } from "../infrastructure/regulation/mappers/mapRegulationCrystalTears";
import { parseArmorEffectCsv } from "../infrastructure/regulation/parsers/parseArmorParamCsv";
import { parseCrystalTearGoodsCsv } from "../infrastructure/regulation/parsers/parseCrystalTearGoodsCsv";
import { saveCrystalTearCatalog } from "../infrastructure/regulation/services/saveCrystalTearCatalog";

async function run() {
  const exportsDirectory = argument("--exports");
  const regulation = argument("--regulation");
  const [goods, effects, regulationBytes] = await Promise.all([
    readFile(path.join(exportsDirectory, "EquipParamGoods.csv"), "utf8"),
    readFile(path.join(exportsDirectory, "SpEffectParam.csv"), "utf8"),
    readFile(regulation),
  ]);
  const tears = mapRegulationCrystalTears(parseCrystalTearGoodsCsv(goods), parseArmorEffectCsv(effects));
  console.log(`Validated ${tears.length} Crystal Tears (${tears.filter(({ calculationStatus }) => calculationStatus === "supported").length} supported)`);
  if (process.argv.includes("--dry-run")) return;
  try {
    await connectMongoDB();
    await saveCrystalTearCatalog(tears, { gameVersion: settings.SUPPORTED_GAME_VERSION, sourceHash: createHash("sha256").update(regulationBytes).digest("hex") });
    console.log(`Imported ${tears.length} Crystal Tears`);
  } finally { await disconnectMongoDB(); }
}
function argument(name: string) { const value = process.argv[process.argv.indexOf(name) + 1]; if (!value || value.startsWith("--")) throw new Error(`Missing required argument ${name}`); return path.resolve(value); }
void run().catch((error: unknown) => { console.error(`Crystal Tear import failed: ${error instanceof Error ? error.message : "Unknown error"}`); process.exitCode = 1; });
