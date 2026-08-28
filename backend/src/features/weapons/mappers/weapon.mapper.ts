import type { WeaponCatalogRecord } from "../models/weaponCatalog.model";

export function mapWeaponResponse(record: WeaponCatalogRecord) {
  return {
    id: record.id,
    name: record.name,
    categoryId: record.categoryId,
    weaponTypeId: record.weaponTypeId,
    weight: record.weight,
    iconId: record.iconId,
    swordArtId: record.swordArtId,
    canChangeAffinity: record.canChangeAffinity,
    variants: record.variants.map(({ id, affinity }) => ({ id, affinity })),
    gameVersion: record.gameVersion,
  };
}
