import type {
  DamageTrialAction,
  DamageTrialEffectsSelection,
  SavedBuildDamageRequest,
} from "../types/damageTrial.types";

export function toSavedBuildDamageRequest(
  action: DamageTrialAction,
  bossId: string,
  effects: DamageTrialEffectsSelection,
  bossPhaseId?: string,
): SavedBuildDamageRequest {
  const target = { bossId, ...(bossPhaseId ? { bossPhaseId } : {}) };
  if (action.kind === "weapon-attack") {
    return {
      weaponSlotId: action.weaponSlotId,
      attackId: action.attackId,
      skillBuffActive: action.skillBuffActive,
      ...target,
      ...effects,
    };
  }
  if (action.kind === "weapon-skill") {
    return {
      weaponSlotId: action.weaponSlotId,
      skillAttackId: action.skillAttackId,
      skillBuffActive: action.skillBuffActive,
      ...target,
      ...effects,
    };
  }
  return { spellId: action.spellId, charged: action.charged, ...target, ...effects };
}
