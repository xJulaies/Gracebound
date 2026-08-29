import mongoose from "mongoose";
import type { WeaponCatalogDataSet } from "../../../features/weapons/domain/weaponCatalog.types";
import { ReinforcementModel } from "../../../features/weapons/models/reinforcement.model";
import { ScalingCurveModel } from "../../../features/weapons/models/scalingCurve.model";
import { WeaponVariantModel } from "../../../features/weapons/models/weapon.model";
import { WeaponCatalogModel } from "../../../features/weapons/models/weaponCatalog.model";

export interface WeaponCatalogImportMetadata {
  gameVersion: string;
  sourceHash: string;
}

export interface WeaponCatalogImportSummary {
  gameVersion: string;
  weapons: number;
  variants: number;
  reinforcements: number;
  scalingCurves: number;
  attacks: number;
}

export async function saveWeaponCatalog(
  dataSet: WeaponCatalogDataSet,
  metadata: WeaponCatalogImportMetadata,
): Promise<WeaponCatalogImportSummary> {
  const weapons = Object.values(dataSet.catalog);
  const variants = Object.values(dataSet.calculationData.weapons);
  const reinforcements = Object.entries(dataSet.calculationData.reinforcements);
  const scalingCurves = Object.values(dataSet.calculationData.scalingCurves);

  if (weapons.length === 0 || variants.length === 0) {
    throw new Error("Weapon catalog and calculation variants must not be empty");
  }

  if (
    dataSet.report.canonicalWeapons !== weapons.length ||
    dataSet.report.calculationVariants !== variants.length ||
    dataSet.report.validatedCalculations !== variants.length
  ) {
    throw new Error("Weapon import report does not match the dataset");
  }

  if (variants.some(({ gameVersion }) => gameVersion !== metadata.gameVersion)) {
    throw new Error("Weapon variants do not match the import game version");
  }

  const sourceHash = metadata.sourceHash.toLowerCase();
  const importedAt = new Date();
  const sourceMetadata = {
    source: "REGULATION" as const,
    gameVersion: metadata.gameVersion,
    sourceHash,
    importedAt,
  };
  const weaponRecords = weapons.map((weapon) => ({
    ...weapon,
    ...sourceMetadata,
  }));
  const variantRecords = variants.map((variant) => ({
    ...variant,
    ...sourceMetadata,
  }));
  const reinforcementRecords = reinforcements.map(([id, levels]) => ({
    id,
    levels,
    ...sourceMetadata,
  }));
  const scalingCurveRecords = scalingCurves.map((curve) => ({
    ...curve,
    ...sourceMetadata,
  }));

  await Promise.all([
    ...weaponRecords.map((record) => new WeaponCatalogModel(record).validate()),
    ...variantRecords.map((record) => new WeaponVariantModel(record).validate()),
    ...reinforcementRecords.map((record) =>
      new ReinforcementModel(record).validate(),
    ),
    ...scalingCurveRecords.map((record) =>
      new ScalingCurveModel(record).validate(),
    ),
  ]);

  await Promise.all([
    WeaponCatalogModel.init(),
    WeaponVariantModel.init(),
    ReinforcementModel.init(),
    ScalingCurveModel.init(),
  ]);

  const session = await mongoose.startSession();

  try {
    await session.withTransaction(async () => {
      const versionFilter = { gameVersion: metadata.gameVersion };

      await WeaponCatalogModel.deleteMany(versionFilter, { session });
      await WeaponVariantModel.deleteMany(versionFilter, { session });
      await ReinforcementModel.deleteMany(versionFilter, { session });
      await ScalingCurveModel.deleteMany(versionFilter, { session });

      await WeaponCatalogModel.insertMany(weaponRecords, { session });
      await WeaponVariantModel.insertMany(variantRecords, { session });
      await ReinforcementModel.insertMany(reinforcementRecords, { session });
      await ScalingCurveModel.insertMany(scalingCurveRecords, { session });
    });
  } finally {
    await session.endSession();
  }

  return {
    gameVersion: metadata.gameVersion,
    weapons: weapons.length,
    variants: variants.length,
    reinforcements: reinforcements.length,
    scalingCurves: scalingCurves.length,
    attacks: weapons.reduce(
      (total, weapon) => total + weapon.attacks.length,
      0,
    ),
  };
}
