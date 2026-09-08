import {
  BOSS_LOCATION_TYPES,
  BOSS_REGIONS,
  type BossCatalogSearch,
  type BossLocationType,
  type BossProgression,
  type BossRank,
  type BossRegion,
} from "../types/boss.types";

export function parseBossCatalogSearch(search: Record<string, unknown>): BossCatalogSearch {
  return {
    search: typeof search.search === "string" ? search.search.slice(0, 100) : "",
    ...(isMember(search.region, BOSS_REGIONS) && { region: search.region as BossRegion }),
    ...(isMember(search.locationType, BOSS_LOCATION_TYPES) && {
      locationType: search.locationType as BossLocationType,
    }),
    ...(isMember(search.rank, ["major", "minor"] as const) && {
      rank: search.rank as BossRank,
    }),
    ...(isMember(search.progression, ["required", "route-dependent", "optional"] as const)
      && { progression: search.progression as BossProgression }),
    ...(parseEnabledFilter(search.rewardsGreatRune) && {
      rewardsGreatRune: true,
    }),
    ...(parseEnabledFilter(search.rewardsRemembrance) && {
      rewardsRemembrance: true,
    }),
  };
}

function parseEnabledFilter(value: unknown): boolean {
  return value === true || value === "true";
}

function isMember<T extends string>(value: unknown, values: readonly T[]): value is T {
  return typeof value === "string" && values.some((candidate) => candidate === value);
}
