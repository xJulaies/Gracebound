import type { BossRecord } from "../models/boss.model";
import { getBossImageUrl } from "../domain/boss.types";

export function mapBossResponse(record: BossRecord) {
  return {
    id: record.id,
    name: record.name,
    imageUrl: getBossImageUrl(record.id),
    encounters: record.encounters?.map((encounter) => ({ ...encounter })) ?? [],
    rank: record.rank ?? null,
    progression: record.progression ?? null,
    rewardsGreatRune: record.rewardsGreatRune ?? null,
    rewardsRemembrance: record.rewardsRemembrance ?? null,
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
