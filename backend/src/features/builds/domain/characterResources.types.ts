export interface CharacterResourceCurves {
  maxHp: number[];
  maxFp: number[];
  maxStamina: number[];
  maxEquipLoad: number[];
}

export interface CharacterProgressionCurves extends CharacterResourceCurves {
  levelDefense: number[];
  physicalDefense: number[];
  magicDefense: number[];
  fireDefense: number[];
  holyDefense: number[];
  itemDiscovery: number[];
  statusLevel: {
    poison: number[];
    rot: number[];
    bleed: number[];
    frost: number[];
    sleep: number[];
    madness: number[];
    deathBlight: number[];
  };
  statusAttribute: {
    poison: number[];
    rot: number[];
    bleed: number[];
    frost: number[];
    sleep: number[];
    madness: number[];
    deathBlight: number[];
  };
}

export interface CharacterResources {
  maxHp: number;
  maxFp: number;
  maxStamina: number;
  maxEquipLoad: number;
}
