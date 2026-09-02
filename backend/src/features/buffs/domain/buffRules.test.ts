import { describe, expect, it } from "vitest";
import {
  applyOutgoingBuffMultipliers,
  resolveGeneralBuffSelection,
  validateWeaponBuffExclusivity,
} from "./buffRules";

describe("buff rules", () => {
  it("preserves request order and permits one aura plus one body buff", () => {
    const selected = resolveGeneralBuffSelection(
      ["golden-vow", "flame-grant-me-strength"],
      [bodyBuff, auraBuff],
    );

    expect(selected.map(({ id }) => id)).toEqual([
      "golden-vow",
      "flame-grant-me-strength",
    ]);
  });

  it("rejects duplicate slots, weapon slots, and unknown selections", () => {
    expect(() => resolveGeneralBuffSelection(
      ["flame-grant-me-strength", "howl-of-shabriri"],
      [bodyBuff, secondBodyBuff],
    )).toThrow("Only one active buff per slot is allowed");
    expect(() => resolveGeneralBuffSelection(["weapon-buff"], [weaponBuff]))
      .toThrow("Weapon buff spells require a catalyst selection");
    expect(() => resolveGeneralBuffSelection(["unknown"], []))
      .toThrow("Unsupported buff spell selection");
  });

  it("combines aura and body outgoing multipliers per damage type", () => {
    expect(applyOutgoingBuffMultipliers(unitDamageTypes(), [auraBuff, bodyBuff]))
      .toEqual({ physical: 1.38, magic: 1.15, fire: 1.38, lightning: 1.15, holy: 1.15 });
  });

  it("allows one weapon buff source but rejects spell and skill together", () => {
    expect(() => validateWeaponBuffExclusivity(true, false)).not.toThrow();
    expect(() => validateWeaponBuffExclusivity(false, true)).not.toThrow();
    expect(() => validateWeaponBuffExclusivity(true, true))
      .toThrow("Spell and skill weapon buffs cannot be active together");
  });
});

const auraBuff = buff("golden-vow", "aura", {
  physical: 1.15, magic: 1.15, fire: 1.15, lightning: 1.15, holy: 1.15,
});
const bodyBuff = buff("flame-grant-me-strength", "body", {
  physical: 1.2, magic: 1, fire: 1.2, lightning: 1, holy: 1,
});
const secondBodyBuff = buff("howl-of-shabriri", "body", unitDamageTypes());
const weaponBuff = buff("weapon-buff", "weapon", unitDamageTypes());

function buff(id: string, slot: string, outgoingDamageMultipliers: ReturnType<typeof unitDamageTypes>) {
  return { id, buffEffect: { slot, outgoingDamageMultipliers } };
}

function unitDamageTypes() {
  return { physical: 1, magic: 1, fire: 1, lightning: 1, holy: 1 };
}
