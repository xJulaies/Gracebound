import type {
  CharacterResources,
  CharacterStats,
  DamageTypes,
  StatusResistances,
} from "../../../shared/types/game.types";

export type BuildStats = CharacterStats;

export type WeaponSlotId =
  | "rightHand1"
  | "rightHand2"
  | "rightHand3"
  | "leftHand1"
  | "leftHand2"
  | "leftHand3";

export interface WeaponSelection {
  weaponId: string;
  variantId: string;
  upgradeLevel: number;
  ashOfWarId: string | null;
}

export interface CatalystSelection {
  weaponId: string;
  variantId: string;
  upgradeLevel: number;
}

export interface WeaponBuffSelection {
  spellId: string;
  catalystWeaponId: string;
  catalystVariantId: string;
  upgradeLevel: number;
}

export interface BuildEquipment {
  weaponSlots: Record<WeaponSlotId, WeaponSelection | null>;
  catalyst: CatalystSelection | null;
  armor: {
    headId: string | null;
    chestId: string | null;
    armsId: string | null;
    legsId: string | null;
  };
  greatRuneId: string | null;
  crystalTearIds: string[];
  talismanIds: string[];
  buffSpellIds: string[];
  weaponBuff: WeaponBuffSelection | null;
}

export interface Build {
  id: string;
  name: string;
  description: string;
  characterClassId: string | null;
  level: number;
  stats: BuildStats;
  memoryStoneCount: number;
  spellIds: string[];
  equipment: BuildEquipment;
  visibility: "public" | "private";
  createdAt: string;
  updatedAt: string;
}

export interface BuildStatsInput {
  characterClassId: string;
  stats: CharacterStats;
}

export interface BuildStatsPreview {
  stats: CharacterStats;
  effectiveStats: CharacterStats;
  baseResources: CharacterResources;
  resources: CharacterResources;
  defenses: DamageTypes;
  baseStatusResistances: StatusResistances;
  statusResistances: StatusResistances;
  itemDiscovery: number;
  characterClass: {
    id: string;
    name: string;
    startingLevel: number;
  };
  characterLevel: number;
  nextLevelRuneCost: number | null;
  totalRuneCost: number;
}
