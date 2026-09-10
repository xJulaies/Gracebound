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
    phases: record.phases?.map((phase) => ({
      id: phase.id,
      name: phase.name,
      phaseNumber: phase.phaseNumber,
      trigger: phase.trigger ? { ...phase.trigger } : null,
      health: phase.health,
      defense: { ...phase.defense },
      absorption: {
        physical: { ...phase.absorption.physical },
        magic: phase.absorption.magic,
        fire: phase.absorption.fire,
        lightning: phase.absorption.lightning,
        holy: phase.absorption.holy,
      },
    })) ?? [],
    gameVersion: record.gameVersion,
  };
}
