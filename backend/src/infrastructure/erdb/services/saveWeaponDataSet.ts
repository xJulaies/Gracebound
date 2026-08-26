import mongoose from "mongoose";
import { ReinforcementModel } from "../../../features/weapons/models/reinforcement.model";
import { ScalingCurveModel } from "../../../features/weapons/models/scalingCurve.model";
import { WeaponModel } from "../../../features/weapons/models/weapon.model";
import type { WeaponDataSet } from "../../../features/weapons/domain/weapon.types";

export interface WeaponImportSummary {
  gameVersion: string;
  weapons: number;
  reinforcements: number;
  scalingCurves: number;
}

export async function saveWeaponDataSet(
  dataSet: WeaponDataSet,
): Promise<WeaponImportSummary> {
  const weapons = Object.values(dataSet.weapons);

  if (weapons.length === 0) {
    throw new Error("Weapon dataset must not be empty");
  }

  const gameVersions = new Set(weapons.map((weapon) => weapon.gameVersion));

  if (gameVersions.size !== 1) {
    throw new Error("Weapon dataset must contain exactly one game version");
  }

  const gameVersion = weapons[0]?.gameVersion;

  if (!gameVersion) {
    throw new Error("Weapon dataset has no game version");
  }

  const reinforcements = Object.entries(dataSet.reinforcements);
  const scalingCurves = Object.values(dataSet.scalingCurves);
  const importedAt = new Date();
  const weaponRecords = weapons.map((weapon) => ({
    ...weapon,
    source: "ERDB" as const,
    importedAt,
  }));
  const reinforcementRecords = reinforcements.map(([id, levels]) => ({
    id,
    levels,
    source: "ERDB" as const,
    gameVersion,
    importedAt,
  }));
  const scalingCurveRecords = scalingCurves.map((curve) => ({
    ...curve,
    source: "ERDB" as const,
    gameVersion,
    importedAt,
  }));

  await Promise.all([
    ...weaponRecords.map((record) => new WeaponModel(record).validate()),
    ...reinforcementRecords.map((record) =>
      new ReinforcementModel(record).validate(),
    ),
    ...scalingCurveRecords.map((record) =>
      new ScalingCurveModel(record).validate(),
    ),
  ]);

  await Promise.all([
    WeaponModel.init(),
    ReinforcementModel.init(),
    ScalingCurveModel.init(),
  ]);

  const session = await mongoose.startSession();

  try {
    await session.withTransaction(async () => {
      await WeaponModel.bulkWrite(
        weaponRecords.map((weapon) => ({
          updateOne: {
            filter: { gameVersion, id: weapon.id },
            update: { $set: weapon },
            upsert: true,
          },
        })),
        { session },
      );

      await ReinforcementModel.bulkWrite(
        reinforcementRecords.map((reinforcement) => ({
          updateOne: {
            filter: {
              gameVersion,
              id: reinforcement.id,
            },
            update: { $set: reinforcement },
            upsert: true,
          },
        })),
        { session },
      );

      await ScalingCurveModel.bulkWrite(
        scalingCurveRecords.map((curve) => ({
          updateOne: {
            filter: { gameVersion, id: curve.id },
            update: { $set: curve },
            upsert: true,
          },
        })),
        { session },
      );
    });
  } finally {
    await session.endSession();
  }

  return {
    gameVersion,
    weapons: weapons.length,
    reinforcements: reinforcements.length,
    scalingCurves: scalingCurves.length,
  };
}
