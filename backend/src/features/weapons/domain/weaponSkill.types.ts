import type { DamageTypes } from "../../damage/domain/damage.types";
import type { PhysicalAttackType } from "./weaponAttack.types";

interface SkillDamageComponent {
  sourceAttackId: number;
  physicalAttackType: PhysicalAttackType;
  motionValues: DamageTypes;
  addedDamage: DamageTypes;
  finalDamageRates: DamageTypes;
}

export interface WeaponHitSkillComponent extends SkillDamageComponent {
  kind: "weapon-hit";
  sourceBehaviorId: number;
}

export interface ProjectileSkillComponent extends SkillDamageComponent {
  kind: "projectile";
  sourceBehaviorId: number;
  sourceBulletId: number;
}

export interface WeaponSkillAttack {
  id: string;
  name: string;
  fpCost: number;
  components: Array<WeaponHitSkillComponent | ProjectileSkillComponent>;
}

export interface WeaponSkillProfile {
  id: string;
  name: string;
  sourceSwordArtId: number;
  attacks: WeaponSkillAttack[];
}
