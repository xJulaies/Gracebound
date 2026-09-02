import { apiRequest } from "../../../shared/api/apiClient";
import type { Weapon } from "../types/weapon.types";

export interface WeaponQuery {
  page?: number;
  limit?: number;
  search?: string;
  affinity?: string;
}

export function getWeapons(query: WeaponQuery = {}) {
  const parameters = new URLSearchParams({
    page: String(query.page ?? 1),
    limit: String(query.limit ?? 100),
  });

  if (query.search) parameters.set("search", query.search);
  if (query.affinity) parameters.set("affinity", query.affinity);

  return apiRequest<Weapon>(`/weapons?${parameters.toString()}`);
}
