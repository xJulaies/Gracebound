import type { WeaponSkillProfile } from "../../weapons/domain/weaponSkill.types";
import type { WeaponAffinity } from "../../weapons/domain/weaponCatalog.types";

export interface AshOfWarData {
  id: string;
  sourceGemId: number;
  name: string;
  iconId: number;
  sourceSwordArtId: number;
  compatibleWeaponTypes: string[];
  compatibleAffinities: WeaponAffinity[];
  calculationStatus: "supported" | "catalog-only";
  skill: WeaponSkillProfile | null;
  skillVariants: AshOfWarSkillVariant[];
}

export interface AshOfWarSkillVariant {
  weaponTypes: string[];
  skill: WeaponSkillProfile;
}
