import { describe, expect, it } from "vitest";
import type { CharacterClass } from "../../character-classes/types/characterClass.types";
import {
  changeCharacterClass,
  createCharacterClassSelection,
} from "./characterClassSelection";

const vagabond: CharacterClass = {
  id: "vagabond",
  name: "Vagabond",
  imageUrl: "http://localhost:3000/api/assets/character-classes/vagabond",
  level: 9,
  stats: {
    vigor: 15, mind: 10, endurance: 11, strength: 14,
    dexterity: 13, intelligence: 9, faith: 9, arcane: 7,
  },
  gameVersion: "1.17.0",
};

describe("character class selection", () => {
  it("starts a character with an independent copy of the class stats", () => {
    const selection = createCharacterClassSelection(vagabond);

    expect(selection).toEqual({
      characterClassId: "vagabond",
      stats: vagabond.stats,
      talismanIds: [],
      armorIds: [],
      weaponIds: [],
      greatRuneId: null,
      crystalTearIds: [],
    });
    expect(selection.stats).not.toBe(vagabond.stats);
  });

  it("keeps target stats and raises values below the new class minimum", () => {
    const selection = changeCharacterClass({
      vigor: 40,
      mind: 20,
      endurance: 25,
      strength: 12,
      dexterity: 30,
      intelligence: 9,
      faith: 8,
      arcane: 7,
    }, vagabond);

    expect(selection.characterClassId).toBe("vagabond");
    expect(selection.stats).toEqual({
      vigor: 40,
      mind: 20,
      endurance: 25,
      strength: 14,
      dexterity: 30,
      intelligence: 9,
      faith: 9,
      arcane: 7,
    });
  });
});
