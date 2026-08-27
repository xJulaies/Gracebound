import { afterEach, describe, expect, it, vi } from "vitest";
import { ReinforcementModel } from "../../../features/weapons/models/reinforcement.model";
import { ScalingCurveModel } from "../../../features/weapons/models/scalingCurve.model";
import { WeaponVariantModel } from "../../../features/weapons/models/weapon.model";
import { WeaponCatalogModel } from "../../../features/weapons/models/weaponCatalog.model";
import { useMongoMemoryServer } from "../../../test/useMongoMemoryServer";
import {
  createRegulationWeaponCatalogFixture,
  REGULATION_TEST_GAME_VERSION,
  REGULATION_TEST_SOURCE_HASH,
} from "../../../test/fixtures/regulationWeaponCatalog.fixture";
import { saveWeaponCatalog } from "./saveWeaponCatalog";

useMongoMemoryServer({ replicaSet: true });

afterEach(() => {
  vi.restoreAllMocks();
});

describe("saveWeaponCatalog", () => {
  it("persists the complete normalized catalog transactionally", async () => {
    const summary = await saveWeaponCatalog(createRegulationWeaponCatalogFixture(), {
      gameVersion: REGULATION_TEST_GAME_VERSION,
      sourceHash: REGULATION_TEST_SOURCE_HASH,
    });

    expect(summary).toEqual({
      gameVersion: REGULATION_TEST_GAME_VERSION,
      weapons: 2,
      variants: 2,
      reinforcements: 1,
      scalingCurves: 2,
    });
    expect(await WeaponCatalogModel.countDocuments()).toBe(2);
    expect(await WeaponVariantModel.countDocuments()).toBe(2);
    expect(await ReinforcementModel.countDocuments()).toBe(1);
    expect(await ScalingCurveModel.countDocuments()).toBe(2);

    const moonveil = await WeaponCatalogModel.findOne({ id: "moonveil" }).lean();
    expect(moonveil).toMatchObject({
      source: "REGULATION",
      sourceHash: REGULATION_TEST_SOURCE_HASH,
      variants: [{ id: "moonveil", affinity: "standard" }],
    });
  });

  it("replaces stale records for the imported game version", async () => {
    await saveWeaponCatalog(createRegulationWeaponCatalogFixture(), {
      gameVersion: REGULATION_TEST_GAME_VERSION,
      sourceHash: REGULATION_TEST_SOURCE_HASH,
    });
    const reduced = createRegulationWeaponCatalogFixture();
    delete reduced.catalog["grafted-blade-greatsword"];
    delete reduced.calculationData.weapons["grafted-blade-greatsword"];
    reduced.report.canonicalWeapons = 1;
    reduced.report.calculationVariants = 1;
    reduced.report.validatedCalculations = 1;

    await saveWeaponCatalog(reduced, {
      gameVersion: REGULATION_TEST_GAME_VERSION,
      sourceHash: REGULATION_TEST_SOURCE_HASH,
    });

    expect(await WeaponCatalogModel.countDocuments()).toBe(1);
    expect(await WeaponVariantModel.countDocuments()).toBe(1);
  });

  it("rolls back all collections when a later write fails", async () => {
    vi.spyOn(ScalingCurveModel, "insertMany").mockRejectedValueOnce(
      new Error("Simulated curve failure"),
    );

    await expect(
      saveWeaponCatalog(createRegulationWeaponCatalogFixture(), {
        gameVersion: REGULATION_TEST_GAME_VERSION,
        sourceHash: REGULATION_TEST_SOURCE_HASH,
      }),
    ).rejects.toThrow("Simulated curve failure");

    expect(await WeaponCatalogModel.countDocuments()).toBe(0);
    expect(await WeaponVariantModel.countDocuments()).toBe(0);
    expect(await ReinforcementModel.countDocuments()).toBe(0);
    expect(await ScalingCurveModel.countDocuments()).toBe(0);
  });

  it("rejects an unverified or mismatched dataset before writing", async () => {
    const invalid = createRegulationWeaponCatalogFixture();
    invalid.report.validatedCalculations = 1;

    await expect(
      saveWeaponCatalog(invalid, {
        gameVersion: REGULATION_TEST_GAME_VERSION,
        sourceHash: REGULATION_TEST_SOURCE_HASH,
      }),
    ).rejects.toThrow("Weapon import report does not match the dataset");
    expect(await WeaponCatalogModel.countDocuments()).toBe(0);
  });
});
