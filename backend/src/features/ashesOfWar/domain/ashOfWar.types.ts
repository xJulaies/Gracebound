import type { WeaponSkillProfile } from "../../weapons/domain/weaponSkill.types";
import type { WeaponAffinity } from "../../weapons/domain/weaponCatalog.types";
import type { DamageTypes } from "../../damage/domain/damage.types";
import type { StatusBuildup } from "../../spells/domain/spell.types";
import type { ItemText } from "../../../shared/domain/itemText.types";

export interface SkillBuffEffect {
  durationSeconds: number;
  consumption: "duration" | "next-hit";
  attackPowerMultipliers: DamageTypes;
  outgoingDamageMultipliers: DamageTypes;
  addedDamage: DamageTypes;
  addedStatusBuildup: StatusBuildup;
  poiseDamageMultiplier: number;
  limitations: string[];
}

export interface AshOfWarData extends ItemText {
  id: string;
  sourceGemId: number;
  name: string;
  iconId: number;
  sourceSwordArtId: number;
  compatibleWeaponTypes: string[];
  compatibleAffinities: WeaponAffinity[];
  calculationStatus: "supported" | "catalog-only";
  buffEffect: SkillBuffEffect | null;
  skill: WeaponSkillProfile | null;
  skillVariants: AshOfWarSkillVariant[];
}

export interface AshOfWarSkillVariant {
  weaponTypes: string[];
  skill: WeaponSkillProfile;
}
