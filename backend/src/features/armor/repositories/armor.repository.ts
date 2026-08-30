import { ArmorModel } from "../models/armor.model";

export function findAllArmor(gameVersion: string) {
  return ArmorModel.find({ gameVersion }).sort({ slot: 1, name: 1, id: 1 }).lean().exec();
}

export function findArmorById(id: string, gameVersion: string) {
  return ArmorModel.findOne({ id, gameVersion }).lean().exec();
}

export function findArmorByIds(ids: string[], gameVersion: string) {
  return ArmorModel.find({ id: { $in: ids }, gameVersion }).lean().exec();
}
