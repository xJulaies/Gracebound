import type { WeaponDataSet } from "./weapon.types";
import type { WeaponAttackProfile } from "./weaponAttack.types";
import type { WeaponSkillProfile } from "./weaponSkill.types";
import type { SpellType } from "../../spells/domain/spell.types";
import type { ItemText } from "../../../shared/domain/itemText.types";

export const WEAPON_AFFINITIES = [
  "standard",
  "heavy",
  "keen",
  "quality",
  "fire",
  "flame-art",
  "lightning",
  "sacred",
  "magic",
  "cold",
  "poison",
  "blood",
  "occult",
] as const;

export type WeaponAffinity = (typeof WEAPON_AFFINITIES)[number];

export interface WeaponVariantReference {
  id: string;
  sourceId: number;
  affinity: WeaponAffinity;
}

export interface WeaponCatalogEntry extends ItemText {
  id: string;
  sourceId: number;
  name: string;
  categoryId: number;
  weaponTypeId: number;
  weaponType: string | null;
  weight: number;
  iconId: number;
  swordArtId: number | null;
  canChangeAffinity: boolean;
  castingTypes: SpellType[];
  statusBuildup: WeaponStatusBuildup | null;
  variants: WeaponVariantReference[];
  attacks: WeaponAttackProfile[];
  skills: WeaponSkillProfile[];
}

export interface WeaponStatusBuildup {
  poison: number;
  rot: number;
  bleed: number;
  frost: number;
  sleep: number;
  madness: number;
  deathBlight: number;
}

export interface WeaponImportReport {
  sourceRows: number;
  canonicalWeapons: number;
  calculationVariants: number;
  validatedCalculations: number;
  excludedRows: number;
  affinityCounts: Record<WeaponAffinity, number>;
}

export interface WeaponCatalogDataSet {
  catalog: Record<string, WeaponCatalogEntry>;
  calculationData: WeaponDataSet;
  report: WeaponImportReport;
}
