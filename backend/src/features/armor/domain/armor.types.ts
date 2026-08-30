export type ArmorSlot = "head" | "body" | "arms" | "legs";

export interface ArmorData {
  id: string;
  sourceProtectorId: number;
  name: string;
  slot: ArmorSlot;
  iconId: number;
  weight: number;
  poise: number;
  damageNegation: {
    physical: number;
    strike: number;
    slash: number;
    pierce: number;
    magic: number;
    fire: number;
    lightning: number;
    holy: number;
  };
  resistances: {
    poison: number;
    rot: number;
    bleed: number;
    frost: number;
    sleep: number;
    madness: number;
    deathBlight: number;
  };
  sourceEffectIds: number[];
}
