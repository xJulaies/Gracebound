import { describe, expect, it } from "vitest";
import type { CrystalTearEffects } from "./crystalTear.types";
import { combineCrystalTearEffects } from "./combineCrystalTearEffects";

describe("combineCrystalTearEffects", () => {
  it("adds attributes and multiplies independent resource and damage effects", () => {
    const result = combineCrystalTearEffects([
      effect({ strength: 10 }, { maxHp: 1.1 }, {}),
      effect({ intelligence: 10 }, {}, { magic: 1.2 }),
    ]);
    expect(result).toMatchObject({
      attributeBonuses: { strength: 10, intelligence: 10 },
      resourceMultipliers: { maxHp: 1.1, maxStamina: 1 },
      outgoingDamageMultipliers: { magic: 1.2, physical: 1 },
    });
  });
});

function effect(attributes: Partial<CrystalTearEffects["attributeBonuses"]>, resources: Partial<CrystalTearEffects["resourceMultipliers"]>, damage: Partial<CrystalTearEffects["outgoingDamageMultipliers"]>): CrystalTearEffects {
  return {
    durationSeconds: 180,
    attributeBonuses: { vigor: 0, mind: 0, endurance: 0, strength: 0, dexterity: 0, intelligence: 0, faith: 0, arcane: 0, ...attributes },
    resourceMultipliers: { maxHp: 1, maxStamina: 1, maxEquipLoad: 1, ...resources },
    outgoingDamageMultipliers: { physical: 1, magic: 1, fire: 1, lightning: 1, holy: 1, ...damage },
    chargedAttackDamageMultipliers: { physical: 1, magic: 1, fire: 1, lightning: 1, holy: 1 },
    incomingDamageMultipliers: { physical: 1, magic: 1, fire: 1, lightning: 1, holy: 1 },
    fpCostMultipliers: { skill: 1, sorcery: 1, incantation: 1 },
    poiseDamageMultiplier: 1,
    staminaRecoverySpeedBonus: 0,
    statusResistanceBonuses: { poison: 0, rot: 0, bleed: 0, frost: 0, sleep: 0, madness: 0, deathBlight: 0 },
    cleansesStatusBuildup: [],
    recovery: { instantMaxHpPercent: 0, instantMaxFpPercent: 0, hpPerSecond: 0, hpRegenerationDurationSeconds: 0 },
  };
}
