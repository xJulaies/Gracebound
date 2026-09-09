import type { DamageTypes } from "../../damage/domain/damage.types";

export interface PhysicalAbsorption {
  standard: number;
  slash: number;
  strike: number;
  pierce: number;
}

export interface BossAbsorption {
  physical: PhysicalAbsorption;
  magic: number;
  fire: number;
  lightning: number;
  holy: number;
}

export interface BossData {
  id: string;
  name: string;
  encounters: BossEncounter[];
  rank: BossRank | null;
  progression: BossProgression | null;
  rewardsGreatRune: boolean | null;
  rewardsRemembrance: boolean | null;
  health: number;
  defense: DamageTypes;
  absorption: BossAbsorption;
  sourceNpcId: number;
  healthScalingEffectId: number;
}

const BOSSES_WITH_PORTRAITS = new Set([
  "godfrey-first-elden-lord-47200134",
  "godfrey-first-elden-lord-47210070",
  "godrick-the-grafted",
  "malenia-blade-of-miquella",
  "margit-the-fell-omen",
  "morgott-the-omen-king",
]);

export function getBossImageUrl(bossId: string): string | null {
  return BOSSES_WITH_PORTRAITS.has(bossId) ? `/api/assets/bosses/${bossId}` : null;
}

export interface BossEncounter {
  region: BossRegion;
  location: string | null;
  locationType: BossLocationType | null;
}

export const BOSS_REGIONS = [
  "limgrave", "weeping-peninsula", "liurnia", "caelid", "dragonbarrow",
  "altus-plateau", "mt-gelmir", "leyndell", "mountaintops-of-the-giants",
  "consecrated-snowfield", "siofra-river", "ainsel-river", "deeproot-depths",
  "lake-of-rot", "crumbling-farum-azula", "mohgwyn-palace", "forbidden-lands",
  "miquellas-haligtree",
] as const;
export type BossRegion = (typeof BOSS_REGIONS)[number];

export const BOSS_LOCATION_TYPES = [
  "open-world", "cave", "catacomb", "tunnel", "heroes-grave",
  "evergaol", "dungeon", "legacy-dungeon",
] as const;
export type BossLocationType = (typeof BOSS_LOCATION_TYPES)[number];

export type BossRank = "major" | "minor";
export type BossProgression = "required" | "route-dependent" | "optional";

export const unclassifiedBossMetadata = {
  encounters: [] as BossEncounter[],
  rank: null,
  progression: null,
  rewardsGreatRune: null,
  rewardsRemembrance: null,
} as const;
