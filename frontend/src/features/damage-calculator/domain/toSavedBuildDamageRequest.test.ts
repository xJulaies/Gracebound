import { describe, expect, it } from "vitest";
import { toSavedBuildDamageRequest } from "./toSavedBuildDamageRequest";

const effects = {
  greatRuneActive: false,
  wondrousPhysickActive: false,
  activeBuffSpellIds: [],
  weaponBuffActive: false,
};

describe("toSavedBuildDamageRequest", () => {
  it("uses the saved slot as the trusted Ash of War source for an L2 attack", () => {
    const request = toSavedBuildDamageRequest({
      kind: "weapon-skill",
      weaponSlotId: "rightHand1",
      ashOfWarId: "storm-blade",
      skillAttackId: "storm-blade-projectile",
      label: "L2 — Storm Blade",
      skillBuffActive: false,
    }, "margit-the-fell-omen", effects);

    expect(request).toMatchObject({
      weaponSlotId: "rightHand1",
      skillAttackId: "storm-blade-projectile",
      bossId: "margit-the-fell-omen",
    });
    expect(request).not.toHaveProperty("ashOfWarId");
  });

  it("keeps fixed unique skills on the weapon-skill path", () => {
    expect(toSavedBuildDamageRequest({
      kind: "weapon-skill",
      weaponSlotId: "rightHand1",
      skillAttackId: "transient-moonlight-light",
      label: "L2 — Transient Moonlight (Light)",
      skillBuffActive: false,
    }, "margit-the-fell-omen", effects)).not.toHaveProperty("ashOfWarId");
  });

  it("passes the active encounter phase to the damage API", () => {
    const request = toSavedBuildDamageRequest({
      kind: "weapon-attack",
      weaponSlotId: "rightHand1",
      attackId: "light-1",
      label: "Light attack",
      skillBuffActive: false,
    }, "godfrey-first-elden-lord-47210070", effects, "hoarah-loux");

    expect(request).toMatchObject({
      bossId: "godfrey-first-elden-lord-47210070",
      bossPhaseId: "hoarah-loux",
    });
  });
});
