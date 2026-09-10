import { BossImageAssetModel } from "../models/bossImageAsset.model";

export function findBossImageAsset(bossId: string, gameVersion: string) {
  return BossImageAssetModel.findOne({ bossId, gameVersion })
    .select("checksum mimeType size data")
    .exec();
}

export async function findAvailableBossImageIds(
  bossIds: string[],
  gameVersion: string,
): Promise<Set<string>> {
  if (bossIds.length === 0) return new Set();

  const assets = await BossImageAssetModel.find({
    bossId: { $in: [...new Set(bossIds)] },
    gameVersion,
  })
    .select("bossId")
    .lean()
    .exec();

  return new Set(assets.map(({ bossId }) => bossId));
}
