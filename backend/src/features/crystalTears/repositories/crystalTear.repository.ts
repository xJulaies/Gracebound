import { CrystalTearModel } from "../models/crystalTear.model";
export function findAllCrystalTears(gameVersion: string) { return CrystalTearModel.find({ gameVersion }).sort({ name: 1, id: 1 }).lean().exec(); }
export function findCrystalTearById(id: string, gameVersion: string) { return CrystalTearModel.findOne({ id, gameVersion }).lean().exec(); }
export function findCrystalTearsByIds(ids: string[], gameVersion: string) { return CrystalTearModel.find({ id: { $in: ids }, gameVersion }).lean().exec(); }
