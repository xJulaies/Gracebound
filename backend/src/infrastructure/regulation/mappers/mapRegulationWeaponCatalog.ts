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
import { meleeWeaponClassDefinitions } from "../data/meleeWeaponClassDefinitions";
import type { ArmorEffectRow } from "../schemas/armor.schema";

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
      weaponType:
        meleeWeaponClassDefinitions.find(
          ({ motionCategoryId }) => motionCategoryId === canonicalRow.wepmotionCategory,
        )?.slug ?? null,
      weight: canonicalRow.weight,
      iconId: canonicalRow.iconId,
      swordArtId:
        canonicalRow.swordArtsParamId < 0
          ? null
          : canonicalRow.swordArtsParamId,
      canChangeAffinity: variants.length > 1,
      castingTypes: mapCastingTypes(canonicalRow),
      statusBuildup: mapStatusBuildup(canonicalRow, tables.effects ?? []),
      variants,
      attacks: [],
      skills: [],
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

function mapStatusBuildup(
  weapon: WeaponParamRow,
  effects: ArmorEffectRow[],
): WeaponCatalogDataSet["catalog"][string]["statusBuildup"] {
  const effectIds = [
    weapon.spEffectBehaviorId0,
    weapon.spEffectBehaviorId1,
    weapon.spEffectBehaviorId2,
  ].filter((id) => id >= 0);
  const linkedEffects = effectIds.map((id) => effects.find((effect) => effect.ID === id));
  const statusBuildup = linkedEffects.reduce(
    (total, effect) => ({
      poison: total.poison + Math.max(0, effect?.poizonAttackPower ?? 0),
      rot: total.rot + Math.max(0, effect?.diseaseAttackPower ?? 0),
      bleed: total.bleed + Math.max(0, effect?.bloodAttackPower ?? 0),
      frost: total.frost + Math.max(0, effect?.freezeAttackPower ?? 0),
      sleep: total.sleep + Math.max(0, effect?.sleepAttackPower ?? 0),
      madness: total.madness + Math.max(0, effect?.madnessAttackPower ?? 0),
      deathBlight: total.deathBlight + Math.max(0, effect?.curseAttackPower ?? 0),
    }),
    { poison: 0, rot: 0, bleed: 0, frost: 0, sleep: 0, madness: 0, deathBlight: 0 },
  );

  return Object.values(statusBuildup).some((value) => value > 0)
    ? statusBuildup
    : null;
}

export function mapCastingTypes(row: Pick<WeaponParamRow, "enableMagic" | "enableMiracle">) {
  return [
    ...(row.enableMagic === 1 ? ["sorcery" as const] : []),
    ...(row.enableMiracle === 1 ? ["incantation" as const] : []),
  ];
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
