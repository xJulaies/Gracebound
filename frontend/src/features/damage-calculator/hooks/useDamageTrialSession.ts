import { useAuth } from "@clerk/react";
import { useMutation } from "@tanstack/react-query";
import { useEffect, useReducer } from "react";
import type { Boss } from "../../bosses/types/boss.types";
import { calculateSavedBuildDamage } from "../api/damageTrial.api";
import { toSavedBuildDamageRequest } from "../domain/toSavedBuildDamageRequest";
import type { DamageTrialAction, DamageTrialEffectsSelection, DamageTrialLogEntry } from "../types/damageTrial.types";

type BossPhase = NonNullable<Boss["phases"]>[number];

export function useDamageTrialSession(buildId: string, boss: Boss, effects: DamageTrialEffectsSelection) {
  const { getToken } = useAuth();
  const phases = boss.phases ?? [];
  const initialHealth = phases[0]?.health ?? boss.health;
  const [session, dispatch] = useReducer(damageTrialSessionReducer, createInitialState(initialHealth));
  const activePhase = phases[session.activePhaseIndex];
  const mutation = useMutation({
    mutationFn: (action: DamageTrialAction) => calculateSavedBuildDamage(
      buildId,
      toSavedBuildDamageRequest(action, boss.id, effects, activePhase?.id),
      getToken,
    ),
    onSuccess: (response, action) => {
      const result = response.data[0];
      if (!result) return;
      dispatch({ type: "hit", action, result, id: crypto.randomUUID(), phases });
    },
  });

  useEffect(() => {
    dispatch({ type: "reset", maximumHealth: initialHealth });
  }, [boss.id, initialHealth]);

  useEffect(() => {
    if (!session.phaseTransition) return;
    const timeout = window.setTimeout(() => dispatch({ type: "dismiss-transition" }), 2400);
    return () => window.clearTimeout(timeout);
  }, [session.phaseTransition]);

  function undoLastAttack() {
    dispatch({ type: "undo" });
  }

  function resetTrial() {
    mutation.reset();
    dispatch({ type: "reset", maximumHealth: initialHealth });
  }

  return {
    currentHealth: session.currentHealth,
    currentMaximumHealth: session.currentMaximumHealth,
    activePhase,
    phaseTransition: session.phaseTransition,
    log: session.log,
    mutation,
    undoLastAttack,
    clearLog: () => dispatch({ type: "clear-log" }),
    resetTrial,
  };
}

interface SessionState {
  currentHealth: number;
  currentMaximumHealth: number;
  activePhaseIndex: number;
  phaseTransition: string | null;
  log: DamageTrialLogEntry[];
}

type SessionAction =
  | { type: "hit"; action: DamageTrialAction; result: DamageTrialLogEntry["result"]; id: string; phases?: BossPhase[] }
  | { type: "undo" }
  | { type: "clear-log" }
  | { type: "dismiss-transition" }
  | { type: "reset"; maximumHealth: number };

export function damageTrialSessionReducer(state: SessionState, event: SessionAction): SessionState {
  if (event.type === "hit") {
    const healthAfterHit = Math.max(0, state.currentHealth - Math.max(0, event.result.totalDamage));
    const currentPhase = event.phases?.[state.activePhaseIndex];
    const nextPhase = event.phases?.[state.activePhaseIndex + 1];
    const transitions = Boolean(nextPhase && shouldTransition(nextPhase, currentPhase, healthAfterHit));
    const startsNewHealthBar = transitions && nextPhase?.trigger?.type === "health-depleted";
    const healthAfter = startsNewHealthBar ? nextPhase!.health : healthAfterHit;
    const maximumHealthAfter = startsNewHealthBar ? nextPhase!.health : state.currentMaximumHealth;
    const transitionLabel = transitions ? `Phase ${nextPhase!.phaseNumber}: ${nextPhase!.name}` : undefined;
    return {
      currentHealth: healthAfter,
      currentMaximumHealth: maximumHealthAfter,
      activePhaseIndex: transitions ? state.activePhaseIndex + 1 : state.activePhaseIndex,
      phaseTransition: transitionLabel ?? null,
      log: [...state.log, {
        id: event.id,
        sequence: state.log.length + 1,
        action: event.action,
        result: event.result,
        bossHealthBefore: state.currentHealth,
        bossHealthAfter: healthAfter,
        bossMaximumHealthBefore: state.currentMaximumHealth,
        bossMaximumHealthAfter: maximumHealthAfter,
        phaseIndexBefore: state.activePhaseIndex,
        phaseIndexAfter: transitions ? state.activePhaseIndex + 1 : state.activePhaseIndex,
        phaseName: currentPhase?.name,
        phaseTransition: transitionLabel,
      }],
    };
  }
  if (event.type === "undo") {
    const lastEntry = state.log.at(-1);
    return lastEntry
      ? {
          ...state,
          currentHealth: lastEntry.bossHealthBefore,
          activePhaseIndex: lastEntry.phaseIndexBefore ?? state.activePhaseIndex,
          currentMaximumHealth: lastEntry.bossMaximumHealthBefore ?? state.currentMaximumHealth,
          phaseTransition: null,
          log: state.log.slice(0, -1),
        }
      : state;
  }
  if (event.type === "clear-log") return { ...state, log: [] };
  if (event.type === "dismiss-transition") return { ...state, phaseTransition: null };
  return createInitialState(event.maximumHealth);
}

function shouldTransition(next: BossPhase, current: BossPhase | undefined, healthAfterHit: number) {
  if (next.trigger?.type === "health-depleted") return healthAfterHit === 0;
  if (next.trigger?.type === "health-percentage") {
    return healthAfterHit <= (current?.health ?? next.health) * next.trigger.threshold / 100;
  }
  return false;
}

function createInitialState(maximumHealth: number): SessionState {
  return {
    currentHealth: maximumHealth,
    currentMaximumHealth: maximumHealth,
    activePhaseIndex: 0,
    phaseTransition: null,
    log: [],
  };
}
