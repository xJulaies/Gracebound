import { apiRequest } from "../../../shared/api/apiClient";
import { resolveApiAssetUrl } from "../../../shared/api/resolveApiAssetUrl";
import type { Weapon } from "../types/weapon.types";

export interface WeaponQuery {
  page?: number;
  limit?: number;
  search?: string;
  affinity?: string;
  weaponType?: string;
}

export async function getWeapons(query: WeaponQuery = {}) {
  const parameters = new URLSearchParams({
    page: String(query.page ?? 1),
    limit: String(query.limit ?? 100),
  });

  if (query.search) parameters.set("search", query.search);
  if (query.affinity) parameters.set("affinity", query.affinity);
  if (query.weaponType) parameters.set("weaponType", query.weaponType);

  const response = await apiRequest<Weapon>(`/weapons?${parameters.toString()}`);

  return {
    ...response,
    data: response.data.map((weapon) => ({
      ...weapon,
      iconUrl: resolveApiAssetUrl(weapon.iconUrl),
    })),
  };
}
