import { BossModel } from "../models/boss.model";

export function findAllBosses(gameVersion: string) {
  return BossModel.find({ gameVersion }).sort({ name: 1, id: 1 }).lean().exec();
}

export function findBossById(bossId: string, gameVersion: string) {
  return BossModel.findOne({ id: bossId, gameVersion }).lean().exec();
}
