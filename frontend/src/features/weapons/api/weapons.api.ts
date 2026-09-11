import { apiRequest } from "../../../shared/api/apiClient";
import { resolveApiAssetUrl } from "../../../shared/api/resolveApiAssetUrl";
import { identifierSchema } from "../../../shared/schemas/game.schemas";
import { weaponQuerySchema, weaponSchema } from "../schemas/weapon.schemas";
import type { Weapon } from "../types/weapon.types";

export interface WeaponQuery {
  page?: number;
  limit?: number;
  search?: string;
  affinity?: string;
  weaponType?: string;
}

export async function getWeapons(query: WeaponQuery = {}) {
  const validatedQuery = weaponQuerySchema.parse(query);
  const parameters = new URLSearchParams({
    page: String(validatedQuery.page ?? 1),
    limit: String(validatedQuery.limit ?? 100),
  });

  if (validatedQuery.search) parameters.set("search", validatedQuery.search);
  if (validatedQuery.affinity) parameters.set("affinity", validatedQuery.affinity);
  if (validatedQuery.weaponType) parameters.set("weaponType", validatedQuery.weaponType);

  const response = await apiRequest<Weapon>(`/weapons?${parameters.toString()}`, {
    responseSchema: weaponSchema,
  });

  return {
    ...response,
    data: response.data.map((weapon) => ({
      ...weapon,
      iconUrl: resolveApiAssetUrl(weapon.iconUrl),
    })),
  };
}

export async function getWeapon(weaponId: string) {
  const validatedId = identifierSchema.parse(weaponId);
  const response = await apiRequest<Weapon>(`/weapons/${encodeURIComponent(validatedId)}`, {
    responseSchema: weaponSchema,
  });
  return {
    ...response,
    data: response.data.map((weapon) => ({
      ...weapon,
      iconUrl: resolveApiAssetUrl(weapon.iconUrl),
    })),
  };
}
