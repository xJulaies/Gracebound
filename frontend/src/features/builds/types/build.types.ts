export interface BuildStats {
  vigor: number;
  mind: number;
  endurance: number;
  strength: number;
  dexterity: number;
  intelligence: number;
  faith: number;
  arcane: number;
}

export interface BuildEquipment {
  primaryWeaponId: string | null;
  weaponUpgradeLevel: number;
  armor: {
    headId: string | null;
    chestId: string | null;
    armsId: string | null;
    legsId: string | null;
  };
  talismanIds: string[];
}

export interface Build {
  id: string;
  name: string;
  description: string;
  level: number;
  stats: BuildStats;
  equipment: BuildEquipment;
  visibility: "public" | "private";
  createdAt: string;
  updatedAt: string;
}
