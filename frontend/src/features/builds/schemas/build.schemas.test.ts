import { describe, expect, it } from "vitest";
import {
  buildEditorMetadataSchema,
  buildWriteInputSchema,
} from "./build.schemas";

const validBuild = {
  name: "Moonveil Mage",
  description: "A tested build",
  visibility: "private" as const,
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
    catalyst: null,
    armor: {
      headId: null,
      chestId: null,
      armsId: null,
      legsId: null,
    },
    greatRuneId: null,
    crystalTearIds: [],
    talismanIds: ["graven-mass-talisman"],
    buffSpellIds: [],
    weaponBuff: null,
  },
};

describe("build Zod schemas", () => {
  it("normalizes build metadata", () => {
    expect(buildEditorMetadataSchema.parse({
      name: "  Moonveil Mage  ",
      description: "  Intelligence build  ",
      visibility: "public",
    })).toEqual({
      name: "Moonveil Mage",
      description: "Intelligence build",
      visibility: "public",
    });
  });

  it("accepts the complete build write contract", () => {
    expect(buildWriteInputSchema.parse(validBuild)).toEqual(validBuild);
  });

  it.each<[string, Record<string, unknown>]>([
    ["out-of-range attributes", { stats: { ...validBuild.stats, vigor: 100 } }],
    ["duplicate spells", { spellIds: ["carian-slicer", "carian-slicer"] }],
    ["too many talismans", {
      equipment: {
        ...validBuild.equipment,
        talismanIds: ["one", "two", "three", "four", "five"],
      },
    }],
    ["unsupported fields", { ownerId: "client-authored-owner" }],
  ])("rejects %s", (_case, replacement) => {
    const candidate = {
      ...validBuild,
      ...replacement,
    };

    expect(buildWriteInputSchema.safeParse(candidate).success).toBe(false);
  });

  it("rejects a weapon buff when no weapon is selected", () => {
    const candidate = {
      ...validBuild,
      equipment: {
        ...validBuild.equipment,
        weaponSlots: {
          rightHand1: null,
          rightHand2: null,
          rightHand3: null,
          leftHand1: null,
          leftHand2: null,
          leftHand3: null,
        },
        weaponBuff: {
          spellId: "scholars-armament",
          catalystWeaponId: "academy-glintstone-staff",
          catalystVariantId: "academy-glintstone-staff-standard",
          upgradeLevel: 25,
        },
      },
    };

    const result = buildWriteInputSchema.safeParse(candidate);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.path).toEqual(["equipment", "weaponBuff"]);
    }
  });
});
