import type { Weapon } from "../../weapons/types/weapon.types";
import type { Armor } from "../../armor/types/armor.types";
import type { CharacterClass } from "../../character-classes/types/characterClass.types";
import type { CrystalTear } from "../../crystal-tears/types/crystalTear.types";
import type { GreatRune } from "../../great-runes/types/greatRune.types";
import type { Spell } from "../../spells/types/spell.types";
import type { Talisman } from "../../talismans/types/talisman.types";
import type { BuildStats, CatalystSelection, WeaponBuffSelection, WeaponSelection } from "./build.types";

export interface EquippedWeapon {
  weapon: Weapon;
  variantId: string;
  upgradeLevel: number;
  ashOfWarId: string | null;
  ashOfWar: {
    id: string;
    name: string;
    iconUrl: string;
    buffEffect: {
      durationSeconds: number;
      consumption: "duration" | "next-hit";
    } | null;
  } | null;
}

export type WeaponEditorSlotId =
  | "left-hand-1"
  | "left-hand-2"
  | "left-hand-3"
  | "right-hand-1"
  | "right-hand-2"
  | "right-hand-3";

export type ArmorEditorSlotId =
  | "armor-head"
  | "armor-body"
  | "armor-arms"
  | "armor-legs";

export interface BuildEditorDraft {
  name: string;
  description: string;
  visibility: "public" | "private";
  characterClassId: string | null;
  level: number;
  stats: BuildStats;
  memoryStoneCount: number;
  spellIds: string[];
  weaponSlots: Record<WeaponEditorSlotId, WeaponSelection | null>;
  catalyst: CatalystSelection | null;
  armor: Record<ArmorEditorSlotId, string | null>;
  greatRuneId: string | null;
  crystalTearIds: string[];
  talismanIds: string[];
  buffSpellIds: string[];
  weaponBuff: WeaponBuffSelection | null;
}

export type BuildEditorMetadata = Pick<
  BuildEditorDraft,
  "name" | "description" | "visibility"
>;

export interface WeaponEditorFocus {
  kind: "weapon";
  slotId: WeaponEditorSlotId;
}

export interface SpellEditorFocus {
  kind: "spell";
  slotIndex: number;
}

export type BuildEditorFocus = WeaponEditorFocus | SpellEditorFocus;

export interface ActiveWeaponBuff {
  spellId: string;
  targetSlotId: WeaponEditorSlotId;
  catalystSlotId: WeaponEditorSlotId;
}

export interface BuildEditorInitialState {
  draft: BuildEditorDraft;
  selectedClass: CharacterClass;
  selectedWeapons: Record<string, EquippedWeapon>;
  selectedArmor: Record<string, Armor>;
  selectedTalismans: Record<string, Talisman>;
  selectedGreatRune: GreatRune | null;
  selectedCrystalTears: Record<string, CrystalTear>;
  selectedSpells: Record<number, Spell>;
  activeCatalystSlotId: WeaponEditorSlotId | null;
  activeWeaponBuff: ActiveWeaponBuff | null;
}
