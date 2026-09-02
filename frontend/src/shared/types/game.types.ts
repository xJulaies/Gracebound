export interface CharacterStats {
  vigor: number;
  mind: number;
  endurance: number;
  strength: number;
  dexterity: number;
  intelligence: number;
  faith: number;
  arcane: number;
}

export interface DamageTypes {
  physical: number;
  magic: number;
  fire: number;
  lightning: number;
  holy: number;
}

export interface CharacterResources {
  maxHp: number;
  maxFp: number;
  maxStamina: number;
  maxEquipLoad: number;
}

export interface StatusResistances {
  poison: number;
  rot: number;
  bleed: number;
  frost: number;
  sleep: number;
  madness: number;
  deathBlight: number;
}

export type CalculationStatus = "supported" | "catalog-only";
