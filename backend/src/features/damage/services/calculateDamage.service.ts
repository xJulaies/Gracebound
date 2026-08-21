import { createError } from "../../../shared/errors/createError";
import { weaponFixtures } from "../../weapons/data/weapon.fixtures";
import { calculateAttackRating } from "../../weapons/domain/calculateAttackRating";
import { calculateHitDamage } from "../domain/calculateDamage";
import type {
  CalculateDamageInput,
  WeaponDamageInput,
} from "../schemas/damage.schema";

export function calculateDamageFromInput(input: CalculateDamageInput) {
  if ("attackRating" in input) {
    return calculateHitDamage(input);
  }

  return calculateWeaponDamage(input);
}

function calculateWeaponDamage(input: WeaponDamageInput) {
  const weapon = weaponFixtures.weapons[input.weaponId];

  if (!weapon) {
    throw createError(404, "Weapon not found");
  }

  if (input.upgradeLevel > weapon.maxUpgradeLevel) {
    throw createError(400, "Invalid weapon upgrade level");
  }

  const attackRating = calculateAttackRating(
    weapon,
    input.upgradeLevel,
    input.stats,
    weaponFixtures,
  );
  const calculation = calculateHitDamage({
    attackRating,
    motionValue: input.motionValue,
    target: input.target,
  });

  return {
    weapon: {
      id: weapon.id,
      name: weapon.name,
      gameVersion: weapon.gameVersion,
      upgradeLevel: input.upgradeLevel,
    },
    stats: input.stats,
    ...calculation,
    limitations: calculation.limitations.filter(
      (limitation) =>
        limitation !== "Attack rating must currently be supplied by the client.",
    ),
  };
}

