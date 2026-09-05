import { ReinforcementModel } from "../models/reinforcement.model";
import { ScalingCurveModel } from "../models/scalingCurve.model";
import {
  WeaponVariantModel,
  type WeaponRecord,
} from "../models/weapon.model";
import type {
  AttributeCorrection,
  ReinforcementLevel,
  ScalingCurve,
  WeaponCalculationData,
  WeaponDataSet,
} from "../domain/weapon.types";
import type { WeaponAffinity } from "../domain/weaponCatalog.types";
import {
  WeaponCatalogModel,
  type WeaponCatalogRecord,
} from "../models/weaponCatalog.model";

export interface WeaponCatalogQuery {
  gameVersion: string;
  page: number;
  limit: number;
  search?: string;
  affinity?: WeaponAffinity;
  weaponType?: string;
}

export interface WeaponCatalogPage {
  weapons: WeaponCatalogRecord[];
  total: number;
}

export async function findWeaponCatalogPage({
  gameVersion,
  page,
  limit,
  search,
  affinity,
  weaponType,
}: WeaponCatalogQuery): Promise<WeaponCatalogPage> {
  const filter = {
    gameVersion,
    ...(search && {
      name: { $regex: escapeRegex(search), $options: "i" },
    }),
    ...(affinity && { "variants.affinity": affinity }),
    ...(weaponType && { weaponType }),
  };

  const [weapons, total] = await Promise.all([
    WeaponCatalogModel.find(filter)
      .sort({ name: 1, id: 1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean()
      .exec(),
    WeaponCatalogModel.countDocuments(filter).exec(),
  ]);

  return { weapons, total };
}

export function findWeaponCatalogById(weaponId: string, gameVersion: string) {
  return WeaponCatalogModel.findOne({ id: weaponId, gameVersion }).lean().exec();
}

export function findWeaponCatalogByIds(weaponIds: string[], gameVersion: string) {
  return WeaponCatalogModel.find({ id: { $in: weaponIds }, gameVersion }).lean().exec();
}

export function findWeaponVariantUpgradeLevels(
  variantIds: string[],
  gameVersion: string,
) {
  return WeaponVariantModel.find({ id: { $in: variantIds }, gameVersion })
    .select("id maxUpgradeLevel requirements")
    .lean()
    .exec();
}

export async function findWeaponAttackProfile(
  weaponId: string,
  attackId: string,
  gameVersion: string,
) {
  const weapon = await WeaponCatalogModel.findOne({
    id: weaponId,
    gameVersion,
    "attacks.id": attackId,
  })
    .select("attacks")
    .lean()
    .exec();

  return weapon?.attacks.find(({ id }) => id === attackId) ?? null;
}

export async function findWeaponSkillAttack(
  weaponId: string,
  skillAttackId: string,
  gameVersion: string,
) {
  const weapon = await WeaponCatalogModel.findOne({
    id: weaponId,
    gameVersion,
    "skills.attacks.id": skillAttackId,
  })
    .select("skills")
    .lean()
    .exec();

  return weapon?.skills
    .flatMap(({ attacks }) => attacks)
    .find(({ id }) => id === skillAttackId) ?? null;
}

export interface WeaponCalculationDataSet {
  weapon: WeaponCalculationData;
  dataSet: WeaponDataSet;
}

export async function findWeaponCalculationData(
  weaponId: string,
  gameVersion: string,
): Promise<WeaponCalculationDataSet | null> {
  const weaponRecord = await WeaponVariantModel.findOne({
    id: weaponId,
    gameVersion,
  })
    .lean()
    .exec();

  if (!weaponRecord) {
    return null;
  }

  const curveIds = [
    ...new Set(
      Object.values(weaponRecord.corrections)
        .flat()
        .map((correction) => correction.curveId),
    ),
  ];

  const [reinforcementRecord, scalingCurveRecords] = await Promise.all([
    ReinforcementModel.findOne({
      id: weaponRecord.reinforcementId,
      gameVersion,
    })
      .lean()
      .exec(),
    ScalingCurveModel.find({
      id: { $in: curveIds },
      gameVersion,
    })
      .lean()
      .exec(),
  ]);

  if (!reinforcementRecord) {
    throw new Error(`Missing reinforcement data for weapon ${weaponId}`);
  }

  if (scalingCurveRecords.length !== curveIds.length) {
    throw new Error(`Missing scaling curve data for weapon ${weaponId}`);
  }

  const weapon = toWeaponCalculationData(weaponRecord);
  const reinforcementLevels = reinforcementRecord.levels.map(
    toReinforcementLevel,
  );
  const scalingCurves = Object.fromEntries(
    scalingCurveRecords.map((curve) => [curve.id, toScalingCurve(curve)]),
  );

  return {
    weapon,
    dataSet: {
      weapons: { [weapon.id]: weapon },
      reinforcements: {
        [reinforcementRecord.id]: reinforcementLevels,
      },
      scalingCurves,
    },
  };
}

function toWeaponCalculationData(
  record: WeaponRecord,
): WeaponCalculationData {
  return {
    id: record.id,
    sourceId: record.sourceId,
    name: record.name,
    gameVersion: record.gameVersion,
    maxUpgradeLevel: record.maxUpgradeLevel,
    canApplyWeaponBuff: record.canApplyWeaponBuff,
    reinforcementId: record.reinforcementId,
    requirements: { ...record.requirements },
    baseAttack: { ...record.baseAttack },
    baseScaling: { ...record.baseScaling },
    corrections: toCorrections(record.corrections),
  };
}

function toReinforcementLevel(level: ReinforcementLevel): ReinforcementLevel {
  return {
    level: level.level,
    attackMultiplier: { ...level.attackMultiplier },
    scalingMultiplier: { ...level.scalingMultiplier },
  };
}

function toScalingCurve(curve: ScalingCurve): ScalingCurve {
  return { id: curve.id, values: [...curve.values] };
}

function toCorrections(
  corrections: WeaponCalculationData["corrections"],
): WeaponCalculationData["corrections"] {
  return Object.fromEntries(
    Object.entries(corrections).map(([damageType, entries]) => [
      damageType,
      entries.map((entry) => ({ ...entry })),
    ]),
  ) as Record<keyof WeaponCalculationData["corrections"], AttributeCorrection[]>;
}

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
