export const SPELL_TYPES = ["all", "sorcery", "incantation"] as const;
export type SpellTypeFilter = (typeof SPELL_TYPES)[number];
export type SpellType = Exclude<SpellTypeFilter, "all">;

export const SORCERY_SCHOOLS = [
  "glintstone", "carian", "night", "gravity", "crystal", "cold",
  "magma", "death", "claymen", "thorn", "full-moon", "primeval-current",
] as const;

export const INCANTATION_SCHOOLS = [
  "two-fingers", "erdtree", "golden-order", "dragon-cult",
  "dragon-communion", "bestial", "fire-monks", "giants-flame",
  "godskin-apostle", "frenzied-flame", "servants-of-rot", "blood-oath",
  "crucible",
] as const;

export const SPELL_SCHOOLS = [...SORCERY_SCHOOLS, ...INCANTATION_SCHOOLS] as const;
export type SpellSchool = (typeof SPELL_SCHOOLS)[number];

export interface SpellCatalogSearch {
  type: SpellTypeFilter;
  school?: SpellSchool;
  search: string;
}

export interface Spell {
  id: string;
  name: string;
  summary: string | null;
  description: string | null;
  type: SpellType;
  schools: SpellSchool[];
  fpCost: number;
  chargedFpCost: number | null;
  sustainedFpCost: number | null;
  slotsRequired: number;
  requirements: {
    intelligence: number;
    faith: number;
    arcane: number;
  };
  iconId: number;
  iconUrl: string;
  calculationStatus: "catalog-only" | "supported";
  buffEffect: { slot: "aura" | "body" | "weapon"; durationSeconds: number } | null;
  attack: SpellAttack | null;
  chargedAttack: SpellAttack | null;
  gameVersion: string;
}

interface SpellAttack {
  outputUnit: "per-hit" | "per-tick";
  motionValues: DamageTypes;
  additionalComponents: Array<{
    id: string;
    label: string;
    outputUnit: "per-hit" | "per-tick";
    motionValues: DamageTypes;
  }>;
}

interface DamageTypes {
  physical: number;
  magic: number;
  fire: number;
  lightning: number;
  holy: number;
}
