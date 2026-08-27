import { afterEach, describe, expect, it, vi } from "vitest";
import { weaponFixtures } from "../../../features/weapons/data/weapon.fixtures";
import { ReinforcementModel } from "../../../features/weapons/models/reinforcement.model";
import { ScalingCurveModel } from "../../../features/weapons/models/scalingCurve.model";
import { WeaponVariantModel } from "../../../features/weapons/models/weapon.model";
import { useMongoMemoryServer } from "../../../test/useMongoMemoryServer";
import { saveWeaponDataSet } from "./saveWeaponDataSet";

useMongoMemoryServer({ replicaSet: true });

afterEach(() => {
  vi.restoreAllMocks();
});

function copyWeaponFixtures() {
  return structuredClone(weaponFixtures);
}

describe("saveWeaponDataSet", () => {
  it("persists the normalized dataset and returns a summary", async () => {
    const summary = await saveWeaponDataSet(copyWeaponFixtures());

    expect(summary).toEqual({
      gameVersion: "1.10.0",
      weapons: 2,
      reinforcements: 1,
      scalingCurves: 2,
    });
    expect(await WeaponVariantModel.countDocuments()).toBe(2);
    expect(await ReinforcementModel.countDocuments()).toBe(1);
    expect(await ScalingCurveModel.countDocuments()).toBe(2);

    const moonveil = await WeaponVariantModel.findOne({
      gameVersion: "1.10.0",
      id: "moonveil",
    }).lean();

    expect(moonveil).toMatchObject({
      source: "ERDB",
      sourceId: 9060000,
      name: "Moonveil",
      maxUpgradeLevel: 10,
    });
    expect(moonveil?.importedAt).toBeInstanceOf(Date);
    expect(moonveil).not.toHaveProperty("affinity");
  });

  it("updates an existing version without creating duplicates", async () => {
    await saveWeaponDataSet(copyWeaponFixtures());
    const changedDataSet = copyWeaponFixtures();
    const moonveil = changedDataSet.weapons.moonveil;

    if (!moonveil) {
      throw new Error("Missing Moonveil fixture");
    }

    moonveil.name = "Moonveil Updated";
    await saveWeaponDataSet(changedDataSet);

    expect(await WeaponVariantModel.countDocuments()).toBe(2);
    const updatedMoonveil = await WeaponVariantModel.findOne({
      id: "moonveil",
    }).lean();
    expect(updatedMoonveil?.name).toBe("Moonveil Updated");
    expect(await ReinforcementModel.countDocuments()).toBe(1);
    expect(await ScalingCurveModel.countDocuments()).toBe(2);
  });

  it("keeps different game versions separate", async () => {
    await saveWeaponDataSet(copyWeaponFixtures());
    const olderDataSet = copyWeaponFixtures();

    for (const weapon of Object.values(olderDataSet.weapons)) {
      weapon.gameVersion = "1.09.0";
    }

    await saveWeaponDataSet(olderDataSet);

    expect(await WeaponVariantModel.countDocuments()).toBe(4);
    expect(await ReinforcementModel.countDocuments()).toBe(2);
    expect(await ScalingCurveModel.countDocuments()).toBe(4);
  });

  it("rolls back earlier writes when the import fails", async () => {
    vi.spyOn(ScalingCurveModel, "bulkWrite").mockRejectedValueOnce(
      new Error("Simulated scaling curve failure"),
    );

    await expect(saveWeaponDataSet(copyWeaponFixtures())).rejects.toThrow(
      "Simulated scaling curve failure",
    );

    expect(await WeaponVariantModel.countDocuments()).toBe(0);
    expect(await ReinforcementModel.countDocuments()).toBe(0);
    expect(await ScalingCurveModel.countDocuments()).toBe(0);
  });

  it("rejects an empty dataset before opening a transaction", async () => {
    await expect(
      saveWeaponDataSet({
        weapons: {},
        reinforcements: {},
        scalingCurves: {},
      }),
    ).rejects.toThrow("Weapon dataset must not be empty");
  });

  it("rejects invalid normalized records before writing", async () => {
    const invalidDataSet = copyWeaponFixtures();
    const curve = invalidDataSet.scalingCurves["erdb-0"];

    if (!curve) {
      throw new Error("Missing scaling curve fixture");
    }

    curve.values = [];

    await expect(saveWeaponDataSet(invalidDataSet)).rejects.toThrow(
      "Scaling curve must contain 151 finite values",
    );
    expect(await WeaponVariantModel.countDocuments()).toBe(0);
    expect(await ReinforcementModel.countDocuments()).toBe(0);
    expect(await ScalingCurveModel.countDocuments()).toBe(0);
  });
});
