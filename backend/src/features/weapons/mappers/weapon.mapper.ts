import type { WeaponCatalogRecord } from "../models/weaponCatalog.model";
import { createIconUrl } from "../../../shared/http/createIconUrl";

export function mapWeaponResponse(record: WeaponCatalogRecord) {
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
    variants: record.variants.map(({ id, affinity }) => ({ id, affinity })),
    attacks: record.attacks.map(({ id, name }) => ({ id, name })),
    skills: record.skills.map(({ id, name, attacks }) => ({
      id,
      name,
      attacks: attacks.map(({ id: attackId, name: attackName, fpCost }) => ({
        id: attackId,
        name: attackName,
        fpCost,
      })),
    })),
    gameVersion: record.gameVersion,
  };
}
