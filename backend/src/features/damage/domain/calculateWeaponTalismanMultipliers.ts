import type { TalismanEffects } from "../../talismans/domain/talisman.types";
import type { DamageTypes } from "./damage.types";

interface WeaponAction {
  attackId?: string;
  skillAttackId?: string;
}

export function calculateWeaponTalismanMultipliers(
  talismanEffects: TalismanEffects[],
  action: WeaponAction,
): DamageTypes {
  return talismanEffects.reduce((total, effects) => {
    const actionMultiplier = getActionMultiplier(effects, action);
    return multiplyDamageTypes(
      total,
      effects.outgoingDamageMultipliers,
      actionMultiplier,
    );
  }, unitDamageTypes());
}

function getActionMultiplier(
  effects: TalismanEffects,
  action: WeaponAction,
): DamageTypes {
  if (action.skillAttackId) return effects.skillDamageMultipliers;
  if (action.attackId?.includes("charged-heavy")) {
    return effects.chargedAttackDamageMultipliers;
  }
  if (action.attackId?.includes("jumping")) {
    return effects.conditionalAttackDamageMultipliers.jumping;
  }
  return unitDamageTypes();
}

function multiplyDamageTypes(...multipliers: DamageTypes[]): DamageTypes {
  return {
    physical: multiplyValues(multipliers, "physical"),
    magic: multiplyValues(multipliers, "magic"),
    fire: multiplyValues(multipliers, "fire"),
    lightning: multiplyValues(multipliers, "lightning"),
    holy: multiplyValues(multipliers, "holy"),
  };
}

function multiplyValues(multipliers: DamageTypes[], damageType: keyof DamageTypes) {
  return multipliers.reduce((total, values) => total * values[damageType], 1);
}

function unitDamageTypes(): DamageTypes {
  return { physical: 1, magic: 1, fire: 1, lightning: 1, holy: 1 };
}
