import type { BossRecord } from "../models/boss.model";

export function mapBossResponse(record: BossRecord) {
  return {
    id: record.id,
    name: record.name,
    health: record.health,
    defense: { ...record.defense },
    absorption: {
      physical: { ...record.absorption.physical },
      magic: record.absorption.magic,
      fire: record.absorption.fire,
      lightning: record.absorption.lightning,
      holy: record.absorption.holy,
    },
    gameVersion: record.gameVersion,
  };
}
