import type { DamageTypes } from "../../damage/domain/damage.types";
import type { ItemText } from "../../../shared/domain/itemText.types";

export type SpellType = "sorcery" | "incantation";

export const SORCERY_SCHOOLS = [
  "glintstone", "carian", "night", "gravity", "crystal", "cold",
  "magma", "death", "claymen", "thorn", "full-moon",
  "primeval-current",
] as const;

export const INCANTATION_SCHOOLS = [
  "two-fingers", "erdtree", "golden-order", "dragon-cult",
  "dragon-communion", "bestial", "fire-monks", "giants-flame",
  "godskin-apostle", "frenzied-flame", "servants-of-rot", "blood-oath",
  "crucible",
] as const;

export const SPELL_SCHOOLS = [
  ...SORCERY_SCHOOLS,
  ...INCANTATION_SCHOOLS,
] as const;

export type SpellSchool = (typeof SPELL_SCHOOLS)[number];

export interface StatusBuildup {
  poison: number;
  rot: number;
  bleed: number;
  frost: number;
  sleep: number;
  madness: number;
  deathBlight: number;
}

export interface SpellBuffEffect {
  slot: "aura" | "body" | "weapon";
  durationSeconds: number;
  outgoingDamageMultipliers: DamageTypes;
  weaponAddedDamageScaling: DamageTypes;
  weaponAddedStatusBuildup: StatusBuildup;
  limitations: string[];
}

export interface SpellAttackComponent {
  id: string;
  label: string;
  outputUnit: "per-hit" | "per-tick";
  sourceBulletId: number;
  sourceAttackId: number;
  motionValues: DamageTypes;
  finalDamageRates: DamageTypes;
  statusBuildup: StatusBuildup;
}

export interface SpellAttackProfile extends SpellAttackComponent {
  additionalComponents: SpellAttackComponent[];
}

export interface SpellData extends ItemText {
  id: string;
  sourceMagicId: number;
  name: string;
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
  calculationStatus: "catalog-only" | "supported";
  buffEffect: SpellBuffEffect | null;
  attack: SpellAttackProfile | null;
  chargedAttack: SpellAttackProfile | null;
}
