import { AshOfWarModel } from "../models/ashOfWar.model";
import type { WeaponAffinity } from "../../weapons/domain/weaponCatalog.types";

interface AshOfWarFilters {
  weaponType?: string;
  affinity?: WeaponAffinity;
  calculationStatus?: "supported" | "catalog-only";
}

export function findAllAshesOfWar(gameVersion: string, filters: AshOfWarFilters) {
  return AshOfWarModel.find({
    gameVersion,
    ...(filters.weaponType ? { compatibleWeaponTypes: filters.weaponType } : {}),
    ...(filters.affinity ? { compatibleAffinities: filters.affinity } : {}),
    ...(filters.calculationStatus ? { calculationStatus: filters.calculationStatus } : {}),
  })
    .sort({ name: 1, id: 1 })
    .lean()
    .exec();
}

export function findAshOfWarById(id: string, gameVersion: string) {
  return AshOfWarModel.findOne({ id, gameVersion }).lean().exec();
}

export async function findCompatibleAshOfWarAttack(
  ashOfWarId: string,
  skillAttackId: string,
  weaponType: string,
  gameVersion: string,
) {
  const ash = await AshOfWarModel.findOne({
    id: ashOfWarId,
    gameVersion,
    compatibleWeaponTypes: weaponType,
    calculationStatus: "supported",
  })
    .select("skill skillVariants")
    .lean()
    .exec();

  const skill = ash?.skillVariants.find(({ weaponTypes }) =>
    weaponTypes.includes(weaponType),
  )?.skill ?? ash?.skill;

  return skill?.attacks.find(({ id }) => id === skillAttackId) ?? null;
}
