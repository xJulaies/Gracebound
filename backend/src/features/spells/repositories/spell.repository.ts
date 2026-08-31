import type { SpellType } from "../domain/spell.types";
import { SpellModel } from "../models/spell.model";

export function findAllSpells(gameVersion: string, type?: SpellType) {
  return SpellModel.find({ gameVersion, ...(type ? { type } : {}) }).sort({ type: 1, name: 1, id: 1 }).lean().exec();
}

export function findSpellById(id: string, gameVersion: string) {
  return SpellModel.findOne({ id, gameVersion }).lean().exec();
}

export function findSpellsByIds(ids: string[], gameVersion: string) {
  return SpellModel.find({ id: { $in: ids }, gameVersion }).lean().exec();
}
