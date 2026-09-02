import { CharacterClassImageAssetModel } from "../models/characterClassImageAsset.model";

export function findCharacterClassImageAsset(classId: string, gameVersion: string) {
  return CharacterClassImageAssetModel.findOne({ classId, gameVersion })
    .select("checksum mimeType size data")
    .exec();
}
