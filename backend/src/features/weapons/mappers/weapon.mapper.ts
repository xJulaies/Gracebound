import type { WeaponCatalogRecord } from "../models/weaponCatalog.model";
import { createIconUrl } from "../../../shared/http/createIconUrl";
import type { Attributes } from "../domain/weapon.types";

export interface WeaponVariantPreviewData {
  maxUpgradeLevel: number;
  requirements: Attributes;
}

export function mapWeaponResponse(
  record: WeaponCatalogRecord,
  variantData: ReadonlyMap<string, WeaponVariantPreviewData>,
) {
  const standardVariant = record.variants.find(({ affinity }) => affinity === "standard");
  const requirements = standardVariant
    ? variantData.get(standardVariant.id)?.requirements
    : undefined;

  if (!requirements) {
    throw new Error(`Missing requirement data for weapon ${record.id}`);
  }

  return {
    id: record.id,
    name: record.name,
    summary: record.summary ?? null,
    description: record.description ?? null,
    categoryId: record.categoryId,
    weaponTypeId: record.weaponTypeId,
    weaponType: record.weaponType,
    weight: record.weight,
    iconId: record.iconId,
    iconUrl: createIconUrl(record.iconId),
    swordArtId: record.swordArtId,
    canChangeAffinity: record.canChangeAffinity,
    castingTypes: record.castingTypes,
    requirements,
    statusBuildup: record.statusBuildup,
    variants: record.variants.map(({ id, affinity }) => ({
      id,
      affinity,
      maxUpgradeLevel: getUpgradeLevel(id, variantData),
    })),
    attacks: record.attacks.map(({ id, name }) => ({ id, name })),
    skills: record.skills.map(({ id, name, summary, description, attacks }) => ({
      id,
      name,
      summary: summary ?? null,
      description: description ?? null,
      attacks: attacks.map(({ id: attackId, name: attackName, fpCost }) => ({
        id: attackId,
        name: attackName,
        fpCost,
      })),
    })),
    gameVersion: record.gameVersion,
  };
}

function getUpgradeLevel(
  variantId: string,
  variantData: ReadonlyMap<string, WeaponVariantPreviewData>,
) {
  const maxUpgradeLevel = variantData.get(variantId)?.maxUpgradeLevel;
  if (maxUpgradeLevel === undefined) {
    throw new Error(`Missing upgrade data for weapon variant ${variantId}`);
  }
  return maxUpgradeLevel;
}
