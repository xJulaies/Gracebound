import type { BossImageAssetData } from "../../features/assets/domain/bossImageAsset.types";
import { BossImageAssetModel } from "../../features/assets/models/bossImageAsset.model";

export async function saveBossImageAsset(
  asset: BossImageAssetData,
  gameVersion: string,
) {
  const record = { ...asset, gameVersion, importedAt: new Date() };
  await new BossImageAssetModel(record).validate();
  await BossImageAssetModel.findOneAndReplace(
    { bossId: asset.bossId, gameVersion },
    record,
    { upsert: true },
  );
  return { bossId: asset.bossId, bytes: asset.size };
}
