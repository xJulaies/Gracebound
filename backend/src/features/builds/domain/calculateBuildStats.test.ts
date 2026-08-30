import { describe, expect, it } from "vitest";
import type { BuildStatTalismanEffects, CharacterStats } from "./buildStats.types";
import { applyAttributeBonuses, calculateBuildStats } from "./calculateBuildStats";

const stats: CharacterStats = {
  vigor: 95,
  mind: 30,
  endurance: 25,
  strength: 90,
  dexterity: 30,
  intelligence: 70,
  faith: 8,
  arcane: 8,
};

describe("calculateBuildStats", () => {
  it("combines permanent talisman effects using their correct operation", () => {
    const result = calculateBuildStats(stats, [
      effects({
        attributeBonuses: { vigor: 5, strength: 5 },
        resourceMultipliers: { maxHp: 1.04, maxStamina: 1.1, maxEquipLoad: 1.08 },
        statusResistanceBonuses: { poison: 60, rot: 60 },
        incomingDamageMultipliers: { physical: 0.8 },
        itemDiscoveryRateBonus: 0.75,
      }),
      effects({
        attributeBonuses: { strength: 5 },
        resourceMultipliers: { maxHp: 1.08 },
        statusResistanceBonuses: { bleed: 90, frost: 90 },
        incomingDamageMultipliers: { magic: 0.8 },
      }),
    ]);

    expect(result.stats).toEqual(stats);
    expect(result.effectiveStats).toMatchObject({ vigor: 99, strength: 99 });
    expect(result.resourceMultipliers).toEqual({
      maxHp: 1.1232,
      maxFp: 1,
      maxStamina: 1.1,
      maxEquipLoad: 1.08,
    });
    expect(result.statusResistanceBonuses).toEqual({
      poison: 60, rot: 60, bleed: 90, frost: 90,
      sleep: 0, madness: 0, deathBlight: 0,
    });
    expect(result.incomingDamageMultipliers).toEqual({
      physical: 0.8, magic: 0.8, fire: 1, lightning: 1, holy: 1,
    });
    expect(result.itemDiscoveryBonus).toBe(75);
  });

  it("returns neutral aggregates when no talismans are selected", () => {
    expect(calculateBuildStats(stats, [])).toMatchObject({
      stats,
      effectiveStats: stats,
      resourceMultipliers: { maxHp: 1, maxFp: 1, maxStamina: 1, maxEquipLoad: 1 },
      statusResistanceBonuses: {
        poison: 0, rot: 0, bleed: 0, frost: 0,
        sleep: 0, madness: 0, deathBlight: 0,
      },
      incomingDamageMultipliers: {
        physical: 1, magic: 1, fire: 1, lightning: 1, holy: 1,
      },
      itemDiscoveryBonus: 0,
    });
  });
});

describe("applyAttributeBonuses", () => {
  it("supports the weapon calculator's partial attribute set", () => {
    expect(applyAttributeBonuses(
      { strength: 97, dexterity: 30, intelligence: 70, faith: 8, arcane: 8 },
      [effects({ attributeBonuses: { strength: 5, dexterity: 5 } })],
    )).toEqual({ strength: 99, dexterity: 35, intelligence: 70, faith: 8, arcane: 8 });
  });
});

function effects(overrides: {
  attributeBonuses?: Partial<CharacterStats>;
  resourceMultipliers?: Partial<BuildStatTalismanEffects["resourceMultipliers"]>;
  statusResistanceBonuses?: Partial<BuildStatTalismanEffects["statusResistanceBonuses"]>;
  incomingDamageMultipliers?: Partial<BuildStatTalismanEffects["incomingDamageMultipliers"]>;
  itemDiscoveryRateBonus?: number;
}): BuildStatTalismanEffects {
  return {
    attributeBonuses: {
      vigor: 0, mind: 0, endurance: 0, strength: 0,
      dexterity: 0, intelligence: 0, faith: 0, arcane: 0,
      ...overrides.attributeBonuses,
    },
    resourceMultipliers: {
      maxHp: 1, maxFp: 1, maxStamina: 1, maxEquipLoad: 1,
      ...overrides.resourceMultipliers,
    },
    statusResistanceBonuses: {
      poison: 0, rot: 0, bleed: 0, frost: 0,
      sleep: 0, madness: 0, deathBlight: 0,
      ...overrides.statusResistanceBonuses,
    },
    incomingDamageMultipliers: {
      physical: 1, magic: 1, fire: 1, lightning: 1, holy: 1,
      ...overrides.incomingDamageMultipliers,
    },
    utilityEffects: {
      itemDiscoveryRateBonus: overrides.itemDiscoveryRateBonus ?? 0,
      runeAcquisitionMultiplier: 1,
      memorySlotBonus: 0,
      staminaRecoverySpeedBonus: 0,
      poiseDamageMultiplier: 1,
      skillFpCostMultiplier: 1,
      spellFpCostMultiplier: 1,
      spellEffectDurationMultiplier: 1,
      castingSpeedVirtualDexterity: 0,
    },
  };
}
