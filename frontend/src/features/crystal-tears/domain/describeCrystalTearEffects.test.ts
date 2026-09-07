import { describe, expect, it } from "vitest";
import type { CrystalTear } from "../types/crystalTear.types";
import { describeCrystalTearEffects, getPhysickSimulationStatus } from "./describeCrystalTearEffects";

describe("Crystal Tear presentation rules", () => {
  it("describes verified duration and attribute effects", () => {
    const tear = createTear({
      durationSeconds: 180,
      attributeBonuses: { vigor: 0, mind: 0, endurance: 0, strength: 10, dexterity: 0, intelligence: 0, faith: 0, arcane: 0 },
    });

    expect(describeCrystalTearEffects(tear)).toContain("+10 Strength");
    expect(getPhysickSimulationStatus([tear])).toEqual({
      canActivate: true,
      message: "Verified effects · 180s",
    });
  });

  it("prevents simulation when a selected effect is only catalogued", () => {
    const unsupported = { ...createTear(), name: "Unverified Tear", effects: null };
    expect(getPhysickSimulationStatus([unsupported])).toEqual({
      canActivate: false,
      message: "Not calculable: Unverified Tear.",
    });
  });
});

function createTear(overrides: Partial<NonNullable<CrystalTear["effects"]>> = {}): CrystalTear {
  return {
    id: "strength-knot-crystal-tear",
    name: "Strength-knot Crystal Tear",
    summary: null,
    description: null,
    iconId: 1,
    iconUrl: "/tear.webp",
    calculationStatus: "supported",
    effects: {
      durationSeconds: 0,
      attributeBonuses: { vigor: 0, mind: 0, endurance: 0, strength: 0, dexterity: 0, intelligence: 0, faith: 0, arcane: 0 },
      resourceMultipliers: { maxHp: 1, maxStamina: 1, maxEquipLoad: 1 },
      outgoingDamageMultipliers: { physical: 1, magic: 1, fire: 1, lightning: 1, holy: 1 },
      chargedAttackDamageMultipliers: { physical: 1, magic: 1, fire: 1, lightning: 1, holy: 1 },
      incomingDamageMultipliers: { physical: 1, magic: 1, fire: 1, lightning: 1, holy: 1 },
      fpCostMultipliers: { skill: 1, sorcery: 1, incantation: 1 },
      poiseDamageMultiplier: 1,
      staminaRecoverySpeedBonus: 0,
      statusResistanceBonuses: { poison: 0, rot: 0, bleed: 0, frost: 0, sleep: 0, madness: 0, deathBlight: 0 },
      cleansesStatusBuildup: [],
      recovery: { instantMaxHpPercent: 0, instantMaxFpPercent: 0, hpPerSecond: 0, hpRegenerationDurationSeconds: 0 },
      ...overrides,
    },
    limitations: [],
    gameVersion: "1.17.0",
  };
}
