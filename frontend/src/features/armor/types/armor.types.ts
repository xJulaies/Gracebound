export type ArmorSlot = "head" | "body" | "arms" | "legs";

export interface Armor {
  id: string;
  name: string;
  summary: string | null;
  description: string | null;
  slot: ArmorSlot;
  iconId: number;
  iconUrl: string;
  weight: number;
  poise: number;
  damageNegation: Record<string, number>;
  resistances: Record<string, number>;
  hasPassiveEffects: boolean;
  hasUnresolvedPassiveEffects: boolean;
  passiveEffects: Record<string, unknown>;
  gameVersion: string;
}
