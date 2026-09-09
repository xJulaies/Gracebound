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
const result = { damage: { total: 742 } } as DamageTrialResult;

describe("damageTrialSessionReducer", () => {
  it("applies damage, supports undo, and resets the trial", () => {
    const initial = { currentHealth: 1000, log: [] };
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
    expect(afterReset).toEqual({ currentHealth: 4174, log: [] });
  });

  it("clears history without healing the boss", () => {
    const afterHit = damageTrialSessionReducer(
      { currentHealth: 1000, log: [] },
      { type: "hit", action, result, id: "hit-1" },
    );

    expect(damageTrialSessionReducer(afterHit, { type: "clear-log" })).toEqual({
      currentHealth: 258,
      log: [],
    });
  });
});
