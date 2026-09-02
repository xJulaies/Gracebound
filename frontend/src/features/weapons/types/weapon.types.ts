export interface WeaponVariant {
  id: string;
  affinity: string;
}

export interface WeaponAttack {
  id: string;
  name: string;
}

export interface WeaponSkill {
  id: string;
  name: string;
  attacks: Array<{ id: string; name: string; fpCost: number }>;
}

export interface Weapon {
  id: string;
  name: string;
  categoryId: string;
  weaponTypeId: number;
  weaponType: string;
  weight: number;
  iconId: number;
  iconUrl: string;
  swordArtId: number;
  canChangeAffinity: boolean;
  castingTypes: string[];
  variants: WeaponVariant[];
  attacks: WeaponAttack[];
  skills: WeaponSkill[];
  gameVersion: string;
}
