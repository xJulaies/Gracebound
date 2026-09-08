import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { CharacterClass } from "../../character-classes/types/characterClass.types";
import type { Weapon } from "../../weapons/types/weapon.types";
import { useBuildEditorDraft } from "./useBuildEditorDraft";
import type { BuildEditorInitialState } from "../types/editor.types";

const vagabond: CharacterClass = {
  id: "vagabond",
  name: "Vagabond",
  imageUrl: "/vagabond.webp",
  level: 9,
  stats: {
    vigor: 15,
    mind: 10,
    endurance: 11,
    strength: 14,
    dexterity: 13,
    intelligence: 9,
    faith: 9,
    arcane: 7,
  },
  gameVersion: "1.17.0",
};

const longsword: Weapon = {
  id: "longsword",
  name: "Longsword",
  summary: null,
  description: null,
  categoryId: 1,
  weaponTypeId: 1,
  weaponType: "Straight Sword",
  weight: 3.5,
  iconId: 1,
  iconUrl: "/longsword.webp",
  swordArtId: null,
  canChangeAffinity: true,
  castingTypes: [],
  requirements: {
    strength: 10,
    dexterity: 10,
    intelligence: 0,
    faith: 0,
    arcane: 0,
  },
  statusBuildup: null,
  variants: [{ id: "longsword-standard", affinity: "Standard", maxUpgradeLevel: 25 }],
  attacks: [],
  skills: [],
  gameVersion: "1.17.0",
};

describe("useBuildEditorDraft", () => {
  it("starts a hydrated saved build without unsaved changes", () => {
    const initialState: BuildEditorInitialState = {
      draft: {
        name: "Knight",
        description: "A guarded build",
        visibility: "private",
        characterClassId: "vagabond",
        level: vagabond.level,
        stats: { ...vagabond.stats },
        memoryStoneCount: 0,
        spellIds: [],
        weaponSlots: {
          "right-hand-1": null, "right-hand-2": null, "right-hand-3": null,
          "left-hand-1": null, "left-hand-2": null, "left-hand-3": null,
        },
        catalyst: null,
        armor: {
          "armor-head": null, "armor-body": null,
          "armor-arms": null, "armor-legs": null,
        },
        greatRuneId: null,
        crystalTearIds: [],
        talismanIds: [],
        buffSpellIds: [],
        weaponBuff: null,
      },
      selectedClass: vagabond,
      selectedWeapons: {},
      selectedArmor: {},
      selectedTalismans: {},
      selectedGreatRune: null,
      selectedCrystalTears: {},
      selectedSpells: {},
      activeCatalystSlotId: null,
      activeWeaponBuff: null,
    };

    const { result } = renderHook(() => useBuildEditorDraft(initialState));

    expect(result.current.draft).toEqual(initialState.draft);
    expect(result.current.isDirty).toBe(false);
  });

  it("keeps persistence state in a serializable editor draft", () => {
    const { result } = renderHook(() => useBuildEditorDraft());

    act(() => {
      result.current.setSelectedClass(vagabond);
      result.current.setStats({ ...vagabond.stats, strength: 19 });
      result.current.setSelectedWeapons({
        "right-hand-1": {
          weapon: longsword,
          variantId: "longsword-standard",
          upgradeLevel: 5,
          ashOfWarId: null,
          ashOfWar: null,
        },
      });
      result.current.setMetadata({
        name: "Knight",
        description: "A guarded build",
        visibility: "public",
      });
    });

    expect(result.current.characterLevel).toBe(14);
    expect(result.current.draft).toMatchObject({
      name: "Knight",
      description: "A guarded build",
      visibility: "public",
      characterClassId: "vagabond",
      level: 14,
      stats: { strength: 19 },
      weaponSlots: {
        "right-hand-1": {
          weaponId: "longsword",
          variantId: "longsword-standard",
          upgradeLevel: 5,
        },
        "left-hand-1": null,
      },
    });
    expect(result.current.isDirty).toBe(true);

    act(() => result.current.markSaved(result.current.draft!));
    expect(result.current.isDirty).toBe(false);

    act(() => result.current.setStats((current) => current
      ? { ...current, vigor: current.vigor + 1 }
      : current));
    expect(result.current.isDirty).toBe(true);
  });
});
