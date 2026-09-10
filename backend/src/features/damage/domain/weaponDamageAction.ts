import type { WeaponAttackTrait } from "../../weapons/domain/weaponAttack.types";

export type WeaponDamageAction =
  | { kind: "skill" }
  | { kind: "weapon"; traits: readonly WeaponAttackTrait[] };

export function hasWeaponAttackTrait(
  action: WeaponDamageAction,
  trait: WeaponAttackTrait,
) {
  return action.kind === "weapon" && action.traits.includes(trait);
}
