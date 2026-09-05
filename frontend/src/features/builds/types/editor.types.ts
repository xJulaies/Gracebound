import type { Weapon } from "../../weapons/types/weapon.types";

export interface EquippedWeapon {
  weapon: Weapon;
  variantId: string;
  upgradeLevel: number;
  ashOfWarId: string | null;
  ashOfWar: {
    id: string;
    name: string;
    iconUrl: string;
  } | null;
}

export type WeaponEditorSlotId =
  | "left-hand-1"
  | "left-hand-2"
  | "left-hand-3"
  | "right-hand-1"
  | "right-hand-2"
  | "right-hand-3";

export interface WeaponEditorFocus {
  kind: "weapon";
  slotId: WeaponEditorSlotId;
}
