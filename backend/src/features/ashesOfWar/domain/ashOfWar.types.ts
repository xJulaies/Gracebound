import type { WeaponSkillProfile } from "../../weapons/domain/weaponSkill.types";

export interface AshOfWarData {
  id: string;
  sourceGemId: number;
  name: string;
  iconId: number;
  compatibleWeaponTypes: string[];
  skill: WeaponSkillProfile;
}
