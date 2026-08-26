import { createError } from "../../../shared/errors/createError";
import { settings } from "../../../config/settings";
import { calculateAttackRating } from "../../weapons/domain/calculateAttackRating";
import { findWeaponCalculationData } from "../../weapons/repositories/weapon.repository";
import { calculateHitDamage } from "../domain/calculateDamage";
import type {
  CalculateDamageInput,
  WeaponDamageInput,
} from "../schemas/damage.schema";

export async function calculateDamageFromInput(input: CalculateDamageInput) {
  if ("attackRating" in input) {
    return calculateHitDamage(input);
  }

  return calculateWeaponDamage(input);
}

async function calculateWeaponDamage(input: WeaponDamageInput) {
  const calculationData = await findWeaponCalculationData(
    input.weaponId,
    settings.SUPPORTED_GAME_VERSION,
  );

  if (!calculationData) {
    throw createError(404, "Weapon not found");
  }

  const { weapon, dataSet } = calculationData;

  if (input.upgradeLevel > weapon.maxUpgradeLevel) {
    throw createError(400, "Invalid weapon upgrade level");
  }

  const attackRating = calculateAttackRating(
    weapon,
    input.upgradeLevel,
    input.stats,
    dataSet,
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
