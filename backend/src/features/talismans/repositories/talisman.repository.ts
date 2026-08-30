import { TalismanModel } from "../models/talisman.model";

export function findAllTalismans(gameVersion: string) {
  return TalismanModel.find({ gameVersion }).sort({ name: 1, id: 1 }).lean().exec();
}

export function findTalismanById(id: string, gameVersion: string) {
  return TalismanModel.findOne({ id, gameVersion }).lean().exec();
}

export function findTalismansByIds(ids: string[], gameVersion: string) {
  return TalismanModel.find({ id: { $in: ids }, gameVersion }).lean().exec();
}
