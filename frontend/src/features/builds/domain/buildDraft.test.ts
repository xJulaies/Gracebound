import { describe, expect, it } from "vitest";
import type { Build } from "../types/build.types";
import { toBuildEditorDraft, toBuildWriteInput } from "./buildDraft";

const savedBuild: Build = {
  id: "build-1",
  gameVersion: "1.17.0",
  name: "Moonveil Mage",
  description: "An intelligence build",
  visibility: "private",
  characterClassId: "prisoner",
  level: 125,
  stats: {
    vigor: 40,
    mind: 30,
    endurance: 20,
    strength: 12,
    dexterity: 18,
    intelligence: 60,
    faith: 8,
    arcane: 9,
  },
  memoryStoneCount: 3,
  spellIds: ["carian-slicer"],
  equipment: {
    weaponSlots: {
      rightHand1: {
        weaponId: "moonveil",
        variantId: "moonveil",
        upgradeLevel: 10,
        ashOfWarId: null,
      },
      rightHand2: null,
      rightHand3: null,
      leftHand1: null,
      leftHand2: null,
      leftHand3: null,
    },
    catalyst: {
      weaponId: "academy-glintstone-staff",
      variantId: "academy-glintstone-staff",
      upgradeLevel: 25,
    },
    armor: {
      headId: "spellblade-pointed-hat",
      chestId: null,
      armsId: null,
      legsId: null,
    },
    greatRuneId: "godricks-great-rune",
    crystalTearIds: ["magic-shrouding-cracked-tear"],
    talismanIds: ["graven-mass-talisman"],
    buffSpellIds: [],
    weaponBuff: null,
  },
  createdAt: "2026-09-07T10:00:00.000Z",
  updatedAt: "2026-09-07T10:00:00.000Z",
};

describe("build draft mapping", () => {
  it("maps persisted API slots to editor-owned slot names", () => {
    const draft = toBuildEditorDraft(savedBuild);

    expect(draft.weaponSlots["right-hand-1"]).toEqual(
      savedBuild.equipment.weaponSlots.rightHand1,
    );
    expect(draft.armor["armor-head"]).toBe("spellblade-pointed-hat");
    expect(draft).not.toHaveProperty("id");
    expect(draft).not.toHaveProperty("gameVersion");
    expect(draft).not.toHaveProperty("createdAt");
  });

  it("maps an editor draft to the protected build write contract", () => {
    const input = toBuildWriteInput(toBuildEditorDraft(savedBuild));

    expect(input).toEqual({
      name: savedBuild.name,
      description: savedBuild.description,
      visibility: savedBuild.visibility,
      characterClassId: savedBuild.characterClassId,
      level: savedBuild.level,
      stats: savedBuild.stats,
      memoryStoneCount: savedBuild.memoryStoneCount,
      spellIds: savedBuild.spellIds,
      equipment: savedBuild.equipment,
    });
    expect(input).not.toHaveProperty("id");
    expect(input).not.toHaveProperty("gameVersion");
  });

  it("does not retain mutable references from an API response", () => {
    const draft = toBuildEditorDraft(savedBuild);

    draft.stats.intelligence = 1;
    draft.spellIds.push("comet");
    draft.weaponSlots["right-hand-1"]!.upgradeLevel = 0;

    expect(savedBuild.stats.intelligence).toBe(60);
    expect(savedBuild.spellIds).toEqual(["carian-slicer"]);
    expect(savedBuild.equipment.weaponSlots.rightHand1?.upgradeLevel).toBe(10);
  });
});
