import type { WeaponDataSet } from "./weapon.types";

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

export interface WeaponCatalogEntry {
  id: string;
  sourceId: number;
  name: string;
  categoryId: number;
  weaponTypeId: number;
  weight: number;
  iconId: number;
  swordArtId: number | null;
  canChangeAffinity: boolean;
  variants: WeaponVariantReference[];
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
