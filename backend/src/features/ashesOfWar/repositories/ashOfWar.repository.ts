import { AshOfWarModel } from "../models/ashOfWar.model";

export function findAllAshesOfWar(gameVersion: string, weaponType?: string) {
  return AshOfWarModel.find({
    gameVersion,
    ...(weaponType ? { compatibleWeaponTypes: weaponType } : {}),
  })
    .sort({ name: 1, id: 1 })
    .lean()
    .exec();
}

export function findAshOfWarById(id: string, gameVersion: string) {
  return AshOfWarModel.findOne({ id, gameVersion }).lean().exec();
}
