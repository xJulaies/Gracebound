import { describe, expect, it } from "vitest";
import { getTalismanEffectSections } from "./getTalismanEffectSections";

describe("getTalismanEffectSections", () => {
  it("hides neutral values and formats supported effects for people", () => {
    const sections = getTalismanEffectSections({
      resourceMultipliers: { maxHp: 1.08, maxFp: 1, maxStamina: 1, maxEquipLoad: 1 },
      attributeBonuses: { vigor: 0, strength: 5 },
      statusResistanceBonuses: { poison: 0, bleed: 90 },
      miscellaneousEffects: { silentMovement: true, preventsRuneLoss: false },
    });

    expect(sections).toEqual([
      { title: "Resources", entries: [{ label: "Maximum HP", value: "+8%" }] },
      { title: "Attributes", entries: [{ label: "Strength", value: "+5" }] },
      { title: "Resistances", entries: [{ label: "Bleed resistance", value: "+90" }] },
      { title: "Utility", entries: [{ label: "Silent movement", value: "Active" }] },
    ]);
  });

  it("combines equal elemental multipliers into one damage entry", () => {
    const sections = getTalismanEffectSections({
      skillDamageMultipliers: {
        physical: 1.15,
        magic: 1.15,
        fire: 1.15,
        lightning: 1.15,
        holy: 1.15,
      },
    });

    expect(sections[0]?.entries).toEqual([{ label: "All damage", value: "+15%" }]);
  });

  it("returns no sections for catalog-only talismans", () => {
    expect(getTalismanEffectSections(null)).toEqual([]);
  });

  it("shows Claw Talisman as a jumping bonus without a general damage bonus", () => {
    const sections = getTalismanEffectSections({
      conditionalAttackDamageMultipliers: {
        jumping: {
          physical: 1.15,
          magic: 1.15,
          fire: 1.15,
          lightning: 1.15,
          holy: 1.15,
        },
      },
      outgoingDamageMultipliers: {
        physical: 1,
        magic: 1,
        fire: 1,
        lightning: 1,
        holy: 1,
      },
    });

    expect(sections).toEqual([{
      title: "Conditional attacks",
      entries: [{ label: "Jumping — all damage", value: "+15%" }],
    }]);
  });
});
