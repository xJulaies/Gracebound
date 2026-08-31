import { describe, expect, it } from "vitest";
import type { CharacterStats } from "./buildStats.types";
import { validateSpellRequirements } from "./validateSpellRequirements";

const stats: CharacterStats = {
  vigor: 10, mind: 10, endurance: 10, strength: 10,
  dexterity: 10, intelligence: 30, faith: 20, arcane: 15,
};

describe("validateSpellRequirements", () => {
  it("accepts spells when all three casting requirements are met", () => {
    expect(() => validateSpellRequirements([{
      name: "Supported Spell",
      requirements: { intelligence: 30, faith: 20, arcane: 15 },
    }], stats)).not.toThrow();
  });

  it.each([
    { intelligence: 31, faith: 0, arcane: 0 },
    { intelligence: 0, faith: 21, arcane: 0 },
    { intelligence: 0, faith: 0, arcane: 16 },
  ])("rejects an unmet requirement", (requirements) => {
    expect(() => validateSpellRequirements([{
      name: "Unsupported Spell",
      requirements,
    }], stats)).toThrow("Attribute requirements not met for Unsupported Spell");
  });
});
