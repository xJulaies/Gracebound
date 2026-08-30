import { createError } from "../../../shared/errors/createError";
import { settings } from "../../../config/settings";
import { findBossById } from "../../bosses/repositories/boss.repository";
import { calculateAttackRating } from "../../weapons/domain/calculateAttackRating";
import {
  findWeaponAttackProfile,
  findWeaponCatalogById,
  findWeaponCalculationData,
  findWeaponSkillAttack,
} from "../../weapons/repositories/weapon.repository";
import type { WeaponSkillAttack } from "../../weapons/domain/weaponSkill.types";
import { findCompatibleAshOfWarAttack } from "../../ashesOfWar/repositories/ashOfWar.repository";
import { findTalismansByIds } from "../../talismans/repositories/talisman.repository";
import { applyAttributeBonuses } from "../../builds/domain/calculateBuildStats";
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
  const [calculationData, attack, talismans] = await Promise.all([
    findWeaponCalculationData(
      input.weaponId,
      settings.SUPPORTED_GAME_VERSION,
    ),
    findSelectedAttack(input),
    findTalismansByIds(input.talismanIds, settings.SUPPORTED_GAME_VERSION),
  ]);

  if (!calculationData) {
    throw createError(404, "Weapon not found");
  }

  if (!attack) {
    throw createError(404, "Weapon attack not found");
  }

  if (talismans.length !== input.talismanIds.length || talismans.some(({ effects }) => !effects)) {
    throw createError(400, "Unsupported talisman selection");
  }

  const { weapon, dataSet } = calculationData;

  if (input.upgradeLevel > weapon.maxUpgradeLevel) {
    throw createError(400, "Invalid weapon upgrade level");
  }

  const effectiveStats = applyAttributeBonuses(
    input.stats,
    talismans.map(({ effects }) => effects!),
  );
  const attackRating = calculateAttackRating(
    weapon,
    input.upgradeLevel,
    effectiveStats,
    dataSet,
  );
  const outgoingDamageMultipliers = talismans.reduce(
    (multipliers, { effects }) => ({
      physical: multipliers.physical * effects!.outgoingDamageMultipliers.physical,
      magic: multipliers.magic * effects!.outgoingDamageMultipliers.magic,
      fire: multipliers.fire * effects!.outgoingDamageMultipliers.fire,
      lightning: multipliers.lightning * effects!.outgoingDamageMultipliers.lightning,
      holy: multipliers.holy * effects!.outgoingDamageMultipliers.holy,
    }),
    unitDamageTypes(),
  );
  const appliedDamageMultipliers = "skillAttackId" in input
    ? talismans.reduce(
      (multipliers, { effects }) => ({
        physical: multipliers.physical * effects!.skillDamageMultipliers.physical,
        magic: multipliers.magic * effects!.skillDamageMultipliers.magic,
        fire: multipliers.fire * effects!.skillDamageMultipliers.fire,
        lightning: multipliers.lightning * effects!.skillDamageMultipliers.lightning,
        holy: multipliers.holy * effects!.skillDamageMultipliers.holy,
      }),
      outgoingDamageMultipliers,
    )
    : input.attackId.includes("charged-heavy")
      ? talismans.reduce(
        (multipliers, { effects }) => ({
          physical: multipliers.physical * effects!.chargedAttackDamageMultipliers.physical,
          magic: multipliers.magic * effects!.chargedAttackDamageMultipliers.magic,
          fire: multipliers.fire * effects!.chargedAttackDamageMultipliers.fire,
          lightning: multipliers.lightning * effects!.chargedAttackDamageMultipliers.lightning,
          holy: multipliers.holy * effects!.chargedAttackDamageMultipliers.holy,
        }),
        outgoingDamageMultipliers,
      )
      : outgoingDamageMultipliers;
  const calculation = calculateAttackOutput(
    attackRating,
    attack,
    target,
    appliedDamageMultipliers,
  );

  return {
    weapon: {
      id: weapon.id,
      name: weapon.name,
      gameVersion: weapon.gameVersion,
      upgradeLevel: input.upgradeLevel,
    },
    stats: input.stats,
    effectiveStats,
    talismans: talismans.map(({ id, name }) => ({ id, name })),
    ...calculation,
    limitations: [
      "Buffs, status effects, and special mechanics are not included.",
    ],
  };
}

async function findSelectedAttack(
  input: WeaponDamageInput,
): Promise<WeaponSkillAttack | null> {
  if ("ashOfWarId" in input) {
    const weapon = await findWeaponCatalogById(
      input.weaponId,
      settings.SUPPORTED_GAME_VERSION,
    );

    if (!weapon?.weaponType) return null;

    return findCompatibleAshOfWarAttack(
      input.ashOfWarId,
      input.skillAttackId,
      weapon.weaponType,
      settings.SUPPORTED_GAME_VERSION,
    );
  }

  if ("skillAttackId" in input) {
    return findWeaponSkillAttack(
      input.weaponId,
      input.skillAttackId,
      settings.SUPPORTED_GAME_VERSION,
    );
  }

  const attack = await findWeaponAttackProfile(
    input.weaponId,
    input.attackId,
    settings.SUPPORTED_GAME_VERSION,
  );

  if (!attack) return null;

  return {
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
