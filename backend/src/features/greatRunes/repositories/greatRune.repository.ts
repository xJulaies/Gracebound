import { GreatRuneModel } from "../models/greatRune.model";

export function findAllGreatRunes(gameVersion: string) {
  return GreatRuneModel.find({ gameVersion }).sort({ name: 1, id: 1 }).lean().exec();
}

export function findGreatRuneById(id: string, gameVersion: string) {
  return GreatRuneModel.findOne({ id, gameVersion }).lean().exec();
}
