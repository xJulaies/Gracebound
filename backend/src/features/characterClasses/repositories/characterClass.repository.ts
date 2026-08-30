import { CharacterClassModel } from "../models/characterClass.model";
import { CharacterProgressionModel } from "../models/characterProgression.model";

export function findAllCharacterClasses(gameVersion: string) {
  return CharacterClassModel.find({ gameVersion }).sort({ level: 1, name: 1 }).lean().exec();
}

export function findCharacterClassById(id: string, gameVersion: string) {
  return CharacterClassModel.findOne({ id, gameVersion }).lean().exec();
}

export function findCharacterResourceCurves(gameVersion: string) {
  return CharacterProgressionModel.findOne({ id: "character-resources", gameVersion })
    .lean()
    .exec();
}
