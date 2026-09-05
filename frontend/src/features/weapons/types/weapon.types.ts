export interface WeaponVariant {
  id: string;
  affinity: string;
  maxUpgradeLevel: number;
}

export interface WeaponAttack {
  id: string;
  name: string;
}

export interface WeaponSkill {
  id: string;
  name: string;
  summary: string | null;
  description: string | null;
  attacks: Array<{ id: string; name: string; fpCost: number }>;
}

export interface WeaponAttributes {
  strength: number;
  dexterity: number;
  intelligence: number;
  faith: number;
  arcane: number;
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

export interface Weapon {
  id: string;
  name: string;
  summary: string | null;
  description: string | null;
  categoryId: number;
  weaponTypeId: number;
  weaponType: string | null;
  weight: number;
  iconId: number;
  iconUrl: string;
  swordArtId: number | null;
  canChangeAffinity: boolean;
  castingTypes: string[];
  requirements: WeaponAttributes;
  statusBuildup: WeaponStatusBuildup | null;
  variants: WeaponVariant[];
  attacks: WeaponAttack[];
  skills: WeaponSkill[];
  gameVersion: string;
}
