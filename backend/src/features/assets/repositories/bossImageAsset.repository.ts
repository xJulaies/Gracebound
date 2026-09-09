import { BossImageAssetModel } from "../models/bossImageAsset.model";

export function findBossImageAsset(bossId: string, gameVersion: string) {
  return BossImageAssetModel.findOne({ bossId, gameVersion })
    .select("checksum mimeType size data")
    .exec();
}
