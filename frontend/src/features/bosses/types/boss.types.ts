import type { DamageTypes } from "../../../shared/types/game.types";

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

export interface BossCatalogSearch {
  search: string;
  region?: BossRegion;
  locationType?: BossLocationType;
  rank?: BossRank;
  progression?: BossProgression;
  rewardsGreatRune?: boolean;
  rewardsRemembrance?: boolean;
}

export type BossFilterKey = Exclude<keyof BossCatalogSearch, "search">;

export interface Boss {
  id: string;
  name: string;
  imageUrl: string | null;
  encounters: Array<{
    region: BossRegion;
    location: string | null;
    locationType: BossLocationType | null;
  }>;
  rank: BossRank | null;
  progression: BossProgression | null;
  rewardsGreatRune: boolean | null;
  rewardsRemembrance: boolean | null;
  health: number;
  defense: DamageTypes;
  absorption: {
    physical: { standard: number; slash: number; strike: number; pierce: number };
    magic: number;
    fire: number;
    lightning: number;
    holy: number;
  };
  phases?: Array<{
    id: string;
    name: string;
    phaseNumber: number;
    trigger: { type: "health-percentage"; threshold: number } | { type: "health-depleted" } | null;
    health: number;
    defense: DamageTypes;
    absorption: {
      physical: { standard: number; slash: number; strike: number; pierce: number };
      magic: number;
      fire: number;
      lightning: number;
      holy: number;
    };
  }>;
  gameVersion: string;
}
