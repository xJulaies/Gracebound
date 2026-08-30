import { describe, expect, it } from "vitest";
import type { ArmorData, ArmorSlot } from "../../armor/domain/armor.types";
import { calculateArmorStats } from "./calculateArmorStats";

describe("calculateArmorStats", () => {
  it("combines armor weight, poise, negation, and resistance points", () => {
    const result = calculateArmorStats([
      armor("helm", "head", 0.1, 4, 7, false),
      armor("chest", "body", 0.2, 8.3, 15, true),
    ]);
    expect(result).toMatchObject({
      equipmentWeight: 12.3,
      poise: 22,
      damageNegation: { physical: 0.28, strike: 0.28 },
      resistanceBonuses: { poison: 20, deathBlight: 20 },
      hasUnresolvedPassiveEffects: true,
    });
  });

  it("rejects two pieces for the same slot", () => {
    expect(() => calculateArmorStats([
      armor("helm", "head", 0.1, 4, 7, false),
      armor("other-helm", "head", 0.2, 5, 8, false),
    ])).toThrow("Only one armor piece per slot is allowed");
  });
});

function armor(id: string, slot: ArmorSlot, negation: number, weight: number, poise: number, passive: boolean): ArmorData {
  return {
    id, name: id, slot, sourceProtectorId: id.length, iconId: 1, weight, poise,
    damageNegation: { physical: negation, strike: negation, slash: negation, pierce: negation, magic: negation, fire: negation, lightning: negation, holy: negation },
    resistances: { poison: 10, rot: 10, bleed: 10, frost: 10, sleep: 10, madness: 10, deathBlight: 10 },
    sourceEffectIds: passive ? [100] : [],
  };
}
