import { useAuth } from "@clerk/react";
import { useMutation } from "@tanstack/react-query";
import { useReducer } from "react";
import type { Boss } from "../../bosses/types/boss.types";
import { calculateSavedBuildDamage } from "../api/damageTrial.api";
import { toSavedBuildDamageRequest } from "../domain/toSavedBuildDamageRequest";
import type { DamageTrialAction, DamageTrialEffectsSelection, DamageTrialLogEntry } from "../types/damageTrial.types";

export function useDamageTrialSession(buildId: string, boss: Boss, effects: DamageTrialEffectsSelection) {
  const { getToken } = useAuth();
  const [session, dispatch] = useReducer(damageTrialSessionReducer, {
    currentHealth: boss.health,
    log: [],
  });
  const mutation = useMutation({
    mutationFn: (action: DamageTrialAction) => calculateSavedBuildDamage(
      buildId,
      toSavedBuildDamageRequest(action, boss.id, effects),
      getToken,
    ),
    onSuccess: (response, action) => {
      const result = response.data[0];
      if (!result) return;
      dispatch({ type: "hit", action, result, id: crypto.randomUUID() });
    },
  });

  function undoLastAttack() {
    dispatch({ type: "undo" });
  }

  function resetTrial() {
    mutation.reset();
    dispatch({ type: "reset", maximumHealth: boss.health });
  }

  return {
    currentHealth: session.currentHealth,
    log: session.log,
    mutation,
    undoLastAttack,
    clearLog: () => dispatch({ type: "clear-log" }),
    resetTrial,
  };
}

interface SessionState {
  currentHealth: number;
  log: DamageTrialLogEntry[];
}

type SessionAction =
  | { type: "hit"; action: DamageTrialAction; result: DamageTrialLogEntry["result"]; id: string }
  | { type: "undo" }
  | { type: "clear-log" }
  | { type: "reset"; maximumHealth: number };

export function damageTrialSessionReducer(state: SessionState, event: SessionAction): SessionState {
  if (event.type === "hit") {
    const healthAfter = Math.max(0, state.currentHealth - Math.max(0, event.result.damage.total));
    return {
      currentHealth: healthAfter,
      log: [...state.log, {
        id: event.id,
        sequence: state.log.length + 1,
        action: event.action,
        result: event.result,
        bossHealthBefore: state.currentHealth,
        bossHealthAfter: healthAfter,
      }],
    };
  }
  if (event.type === "undo") {
    const lastEntry = state.log.at(-1);
    return lastEntry
      ? { currentHealth: lastEntry.bossHealthBefore, log: state.log.slice(0, -1) }
      : state;
  }
  if (event.type === "clear-log") return { ...state, log: [] };
  return { currentHealth: event.maximumHealth, log: [] };
}
