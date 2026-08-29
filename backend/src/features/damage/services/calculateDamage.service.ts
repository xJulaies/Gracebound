import { createError } from "../../../shared/errors/createError";
import { settings } from "../../../config/settings";
import { findBossById } from "../../bosses/repositories/boss.repository";
import { calculateAttackRating } from "../../weapons/domain/calculateAttackRating";
import {
  findWeaponAttackProfile,
  findWeaponCalculationData,
} from "../../weapons/repositories/weapon.repository";
import { calculateAttackOutput } from "../domain/calculateAttackOutput";
import { calculateHitDamage } from "../domain/calculateDamage";
import type {
  CalculateDamageInput,
  WeaponDamageInput,
} from "../schemas/damage.schema";

export async function calculateDamageFromInput(input: CalculateDamageInput) {
  const target = input.bossId
    ? await findDamageTarget(input.bossId)
    : undefined;

  if ("attackRating" in input) {
    return calculateHitDamage({
      attackRating: input.attackRating,
      motionValue: input.motionValue,
      physicalAttackType: input.physicalAttackType,
      target,
    });
  }

  return calculateWeaponDamage(input, target);
}

async function calculateWeaponDamage(
  input: WeaponDamageInput,
  target?: Awaited<ReturnType<typeof findDamageTarget>>,
) {
  const [calculationData, attack] = await Promise.all([
    findWeaponCalculationData(
      input.weaponId,
      settings.SUPPORTED_GAME_VERSION,
    ),
    findWeaponAttackProfile(
      input.weaponId,
      input.attackId,
      settings.SUPPORTED_GAME_VERSION,
    ),
  ]);

  if (!calculationData) {
    throw createError(404, "Weapon not found");
  }

  if (!attack) {
    throw createError(404, "Weapon attack not found");
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
  const calculation = calculateAttackOutput(
    attackRating,
    {
      id: attack.id,
      name: attack.name,
      fpCost: 0,
      components: [
        {
          kind: "weapon-hit",
          sourceBehaviorId: attack.sourceBehaviorId,
          sourceAttackId: attack.sourceAttackId,
          physicalAttackType: attack.physicalAttackType,
          motionValues: attack.motionValues,
          addedDamage: emptyDamageTypes(),
          finalDamageRates: unitDamageTypes(),
        },
      ],
    },
    target,
  );

  return {
    weapon: {
      id: weapon.id,
      name: weapon.name,
      gameVersion: weapon.gameVersion,
      upgradeLevel: input.upgradeLevel,
    },
    stats: input.stats,
    ...calculation,
    limitations: [
      "Buffs, status effects, and special mechanics are not included.",
    ],
  };
}

function emptyDamageTypes() {
  return { physical: 0, magic: 0, fire: 0, lightning: 0, holy: 0 };
}

function unitDamageTypes() {
  return { physical: 1, magic: 1, fire: 1, lightning: 1, holy: 1 };
}

async function findDamageTarget(bossId: string) {
  const boss = await findBossById(bossId, settings.SUPPORTED_GAME_VERSION);

  if (!boss) {
    throw createError(404, "Boss not found");
  }

  return {
    id: boss.id,
    name: boss.name,
    defense: boss.defense,
    absorption: boss.absorption,
  };
}
