import {
  WEAPON_AFFINITIES,
  type WeaponAffinity,
  type WeaponCatalogDataSet,
} from "../../../features/weapons/domain/weaponCatalog.types";
import { calculateAttackRating } from "../../../features/weapons/domain/calculateAttackRating";
import type { WeaponDataSet } from "../../../features/weapons/domain/weapon.types";
import type { RegulationWeaponTables } from "./mapRegulationWeaponData";
import { mapRegulationWeapon } from "./mapRegulationWeaponData";
import type { WeaponParamRow } from "../schemas/weaponParam.schema";
import { addRegulationWeaponNames } from "../data/regulationWeaponNames";

const PLAYER_WEAPON_CATEGORIES = new Set([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);

export function mapRegulationWeaponCatalog(
  gameVersion: string,
  tables: RegulationWeaponTables,
): WeaponCatalogDataSet {
  const namedTables = {
    ...tables,
    weapons: addRegulationWeaponNames(gameVersion, tables.weapons),
  };
  const calculationData: WeaponDataSet = {
    weapons: {},
    reinforcements: {},
    scalingCurves: {},
  };
  const catalog: WeaponCatalogDataSet["catalog"] = {};
  const affinityCounts = Object.fromEntries(
    WEAPON_AFFINITIES.map((affinity) => [affinity, 0]),
  ) as Record<WeaponAffinity, number>;
  const canonicalRows = namedTables.weapons.filter(
    isCanonicalPlayerWeapon,
  );

  for (const canonicalRow of canonicalRows) {
    const id = slugify(canonicalRow.Name);

    if (catalog[id]) {
      throw new Error(`Duplicate canonical weapon ID ${id}`);
    }

    const variantRows = namedTables.weapons
      .filter(
        (row) =>
          row.originEquipWep === canonicalRow.ID &&
          row.ID >= canonicalRow.ID &&
          row.ID <= canonicalRow.ID + 1200 &&
          row.Name.trim().length > 0,
      )
      .sort((left, right) => left.ID - right.ID);

    const variants = variantRows.map((variantRow) => {
      const affinity = getWeaponAffinity(canonicalRow.ID, variantRow);
      affinityCounts[affinity] += 1;

      const mapped = mapRegulationWeapon(variantRow.ID, gameVersion, namedTables);
      mergeUnique(calculationData.weapons, mapped.weapons, "weapon");
      mergeShared(calculationData.reinforcements, mapped.reinforcements, "reinforcement");
      mergeShared(calculationData.scalingCurves, mapped.scalingCurves, "scaling curve");
      const variantId = Object.keys(mapped.weapons)[0];

      if (!variantId) {
        throw new Error(`Missing mapped variant for ${variantRow.Name}`);
      }

      return { id: variantId, sourceId: variantRow.ID, affinity };
    });

    catalog[id] = {
      id,
      sourceId: canonicalRow.ID,
      name: canonicalRow.Name,
      categoryId: canonicalRow.weaponCategory,
      weaponTypeId: canonicalRow.wepType,
      weight: canonicalRow.weight,
      iconId: canonicalRow.iconId,
      swordArtId:
        canonicalRow.swordArtsParamId < 0
          ? null
          : canonicalRow.swordArtsParamId,
      canChangeAffinity: variants.length > 1,
      variants,
    };
  }

  const calculationVariants = Object.keys(calculationData.weapons).length;
  const validatedCalculations = validateCalculations(calculationData);

  return {
    catalog,
    calculationData,
    report: {
      sourceRows: tables.weapons.length,
      canonicalWeapons: Object.keys(catalog).length,
      calculationVariants,
      validatedCalculations,
      excludedRows: tables.weapons.length - calculationVariants,
      affinityCounts,
    },
  };
}

function validateCalculations(dataSet: WeaponDataSet): number {
  let validated = 0;

  for (const weapon of Object.values(dataSet.weapons)) {
    const attackRating = calculateAttackRating(
      weapon,
      weapon.maxUpgradeLevel,
      {
        strength: 99,
        dexterity: 99,
        intelligence: 99,
        faith: 99,
        arcane: 99,
      },
      dataSet,
    );

    if (Object.values(attackRating).some((value) => !Number.isFinite(value) || value < 0)) {
      throw new Error(`Invalid attack rating for ${weapon.name}`);
    }
    validated += 1;
  }

  return validated;
}

export function isCanonicalPlayerWeapon(row: WeaponParamRow): boolean {
  return row.ID === row.originEquipWep &&
    row.Name.trim().length > 0 &&
    PLAYER_WEAPON_CATEGORIES.has(row.weaponCategory);
}

export function getWeaponAffinity(
  canonicalSourceId: number,
  variant: WeaponParamRow,
) {
  const affinityIndex = (variant.ID - canonicalSourceId) / 100;
  const affinity = WEAPON_AFFINITIES[affinityIndex];

  if (!Number.isInteger(affinityIndex) || !affinity) {
    throw new Error(`Unsupported affinity offset for ${variant.Name}`);
  }

  return affinity;
}

function mergeUnique<T>(target: Record<string, T>, source: Record<string, T>, label: string) {
  for (const [id, value] of Object.entries(source)) {
    if (target[id]) throw new Error(`Duplicate ${label} ID ${id}`);
    target[id] = value;
  }
}

function mergeShared<T>(target: Record<string, T>, source: Record<string, T>, label: string) {
  for (const [id, value] of Object.entries(source)) {
    const existing = target[id];
    if (existing && JSON.stringify(existing) !== JSON.stringify(value)) {
      throw new Error(`Conflicting ${label} ID ${id}`);
    }
    target[id] ??= value;
  }
}

function slugify(value: string): string {
  return value.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}
