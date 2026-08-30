import { describe, expect, it } from "vitest";
import type { CharacterClassData } from "../../characterClasses/domain/characterClass.types";
import { calculateCharacterLevel } from "./calculateCharacterLevel";

const vagabond: CharacterClassData = {
  id: "vagabond",
  name: "Vagabond",
  level: 9,
  stats: {
    vigor: 15, mind: 10, endurance: 11, strength: 14,
    dexterity: 13, intelligence: 9, faith: 9, arcane: 7,
  },
};

describe("calculateCharacterLevel", () => {
  it("returns the starting level for unchanged class attributes", () => {
    expect(calculateCharacterLevel(vagabond, vagabond.stats)).toBe(9);
  });

  it("adds every invested attribute point to the starting level", () => {
    expect(calculateCharacterLevel(vagabond, {
      ...vagabond.stats,
      vigor: 20,
      strength: 16,
      intelligence: 10,
    })).toBe(17);
  });

  it("rejects attributes below the selected class minimum", () => {
    expect(() => calculateCharacterLevel(vagabond, {
      ...vagabond.stats,
      arcane: 6,
    })).toThrow("arcane cannot be lower than the Vagabond starting value");
  });
});
