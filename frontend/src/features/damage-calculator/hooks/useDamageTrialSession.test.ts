import { describe, expect, it } from "vitest";
import type { DamageTrialAction, DamageTrialResult } from "../types/damageTrial.types";
import { damageTrialSessionReducer } from "./useDamageTrialSession";

const action: DamageTrialAction = {
  kind: "weapon-attack",
  weaponSlotId: "rightHand1",
  attackId: "light-1",
  label: "Light attack (R1)",
  skillBuffActive: false,
};
const result = { damage: { total: 700 }, totalDamage: 742 } as DamageTrialResult;

describe("damageTrialSessionReducer", () => {
  it("applies damage, supports undo, and resets the trial", () => {
    const initial = initialState(1000);
    const afterHit = damageTrialSessionReducer(initial, { type: "hit", action, result, id: "hit-1" });

    expect(afterHit.currentHealth).toBe(258);
    expect(afterHit.log[0]).toMatchObject({
      sequence: 1,
      bossHealthBefore: 1000,
      bossHealthAfter: 258,
    });

    const afterUndo = damageTrialSessionReducer(afterHit, { type: "undo" });
    expect(afterUndo).toEqual(initial);

    const afterReset = damageTrialSessionReducer(afterHit, { type: "reset", maximumHealth: 4174 });
    expect(afterReset).toEqual(initialState(4174));
  });

  it("clears history without healing the boss", () => {
    const afterHit = damageTrialSessionReducer(
      initialState(1000),
      { type: "hit", action, result, id: "hit-1" },
    );

    expect(damageTrialSessionReducer(afterHit, { type: "clear-log" })).toEqual({
      ...initialState(1000),
      currentHealth: 258,
      log: [],
    });
  });

  it("switches phase at an HP threshold without replacing the health bar", () => {
    const afterHit = damageTrialSessionReducer(initialState(1000), {
      type: "hit", action, result, id: "hit-1", phases: [
        phase("godfrey", 1, null, 1000),
        phase("hoarah-loux", 2, { type: "health-percentage", threshold: 50 }, 1000),
      ],
    });

    expect(afterHit).toMatchObject({
      currentHealth: 258,
      currentMaximumHealth: 1000,
      activePhaseIndex: 1,
      phaseTransition: "Phase 2: hoarah-loux",
    });
  });

  it("starts a separate second health bar after phase one is depleted", () => {
    const afterHit = damageTrialSessionReducer(initialState(700), {
      type: "hit", action, result, id: "hit-1", phases: [
        phase("malenia", 1, null, 700),
        phase("goddess-of-rot", 2, { type: "health-depleted" }, 560),
      ],
    });

    expect(afterHit).toMatchObject({
      currentHealth: 560,
      currentMaximumHealth: 560,
      activePhaseIndex: 1,
      phaseTransition: "Phase 2: goddess-of-rot",
    });
  });
});

function initialState(health: number) {
  return { currentHealth: health, currentMaximumHealth: health, activePhaseIndex: 0, phaseTransition: null, log: [] };
}

function phase(name: string, phaseNumber: number, trigger: null | { type: "health-percentage"; threshold: number } | { type: "health-depleted" }, health: number) {
  return {
    id: name, name, phaseNumber, trigger, health,
    defense: { physical: 100, magic: 100, fire: 100, lightning: 100, holy: 100 },
    absorption: { physical: { standard: 0, slash: 0, strike: 0, pierce: 0 }, magic: 0, fire: 0, lightning: 0, holy: 0 },
  };
}
