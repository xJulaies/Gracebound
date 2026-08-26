import { settings } from "../config/settings";
import { connectMongoDB, disconnectMongoDB } from "../db";
import { mapErdbWeaponData } from "../infrastructure/erdb/mappers/mapErdbWeaponData";
import { loadErdbWeaponData } from "../infrastructure/erdb/services/loadErdbWeaponData";
import { saveWeaponDataSet } from "../infrastructure/erdb/services/saveWeaponDataSet";

async function importWeaponData() {
  const rawData = await loadErdbWeaponData(
    settings.ERDB_BASE_URL,
    settings.SUPPORTED_GAME_VERSION,
  );
  const weaponDataSet = mapErdbWeaponData(rawData);

  try {
    await connectMongoDB();
    const summary = await saveWeaponDataSet(weaponDataSet);

    console.log(
      `Imported game version ${summary.gameVersion}: ${summary.weapons} weapons, ${summary.reinforcements} reinforcement datasets, ${summary.scalingCurves} scaling curves`,
    );
  } finally {
    await disconnectMongoDB();
  }
}

void importWeaponData().catch(() => {
  console.error("Weapon data import failed");
  process.exitCode = 1;
});
