import { weaponFixtures } from "../../features/weapons/data/weapon.fixtures";
import type { WeaponCatalogDataSet } from "../../features/weapons/domain/weaponCatalog.types";

export const REGULATION_TEST_GAME_VERSION = "1.17.0";
export const REGULATION_TEST_SOURCE_HASH = "a".repeat(64);

export function createRegulationWeaponCatalogFixture(): WeaponCatalogDataSet {
  const calculationData = structuredClone(weaponFixtures);

  calculationData.reinforcements = renameKeys(
    calculationData.reinforcements,
    regulationId,
  );
  calculationData.scalingCurves = Object.fromEntries(
    Object.entries(calculationData.scalingCurves).map(([id, curve]) => {
      const mappedId = regulationId(id);
      return [mappedId, { ...curve, id: mappedId }];
    }),
  );

  Object.values(calculationData.weapons).forEach((weapon) => {
    weapon.gameVersion = REGULATION_TEST_GAME_VERSION;
    weapon.reinforcementId = regulationId(weapon.reinforcementId);

    Object.values(weapon.corrections)
      .flat()
      .forEach((correction) => {
        correction.curveId = regulationId(correction.curveId);
      });
  });

  return {
    catalog: {
      moonveil: catalogWeapon("moonveil", 9060000, "Moonveil"),
      "grafted-blade-greatsword": catalogWeapon(
        "grafted-blade-greatsword",
        4100000,
        "Grafted Blade Greatsword",
      ),
    },
    calculationData,
    report: {
      sourceRows: 2,
      canonicalWeapons: 2,
      calculationVariants: 2,
      validatedCalculations: 2,
      excludedRows: 0,
      affinityCounts: {
        standard: 2,
        heavy: 0,
        keen: 0,
        quality: 0,
        fire: 0,
        "flame-art": 0,
        lightning: 0,
        sacred: 0,
        magic: 0,
        cold: 0,
        poison: 0,
        blood: 0,
        occult: 0,
      },
    },
  };
}

function regulationId(id: string): string {
  return id.replace(/^erdb-/, "regulation-");
}

function renameKeys<T>(
  values: Record<string, T>,
  mapKey: (key: string) => string,
): Record<string, T> {
  return Object.fromEntries(
    Object.entries(values).map(([key, value]) => [mapKey(key), value]),
  );
}

function catalogWeapon(id: string, sourceId: number, name: string) {
  return {
    id,
    sourceId,
    name,
    categoryId: 3,
    weaponTypeId: 13,
    weight: 6.5,
    iconId: sourceId,
    swordArtId: 1178,
    canChangeAffinity: false,
    variants: [{ id, sourceId, affinity: "standard" as const }],
  };
}
