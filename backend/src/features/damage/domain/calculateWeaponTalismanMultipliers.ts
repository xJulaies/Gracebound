import type { TalismanEffects } from "../../talismans/domain/talisman.types";
import type { DamageTypes } from "./damage.types";
import {
  hasWeaponAttackTrait,
  type WeaponDamageAction,
} from "./weaponDamageAction";

export function calculateWeaponTalismanMultipliers(
  talismanEffects: TalismanEffects[],
  action: WeaponDamageAction,
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
  action: WeaponDamageAction,
): DamageTypes {
  if (action.kind === "skill") return effects.skillDamageMultipliers;

  return multiplyDamageTypes(
    hasWeaponAttackTrait(action, "charged")
      ? effects.chargedAttackDamageMultipliers
      : unitDamageTypes(),
    hasWeaponAttackTrait(action, "jumping")
      ? effects.conditionalAttackDamageMultipliers.jumping
      : unitDamageTypes(),
  );
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
