import { apiRequest } from "../../../shared/api/apiClient";
import { resolveApiAssetUrl } from "../../../shared/api/resolveApiAssetUrl";
import type { AshOfWar } from "../types/ashOfWar.types";

export interface AshOfWarQuery {
  weaponType?: string;
  affinity?: string;
}

export async function getAshesOfWar(query: AshOfWarQuery = {}) {
  const parameters = new URLSearchParams();
  if (query.weaponType) parameters.set("weaponType", query.weaponType);
  if (query.affinity) parameters.set("affinity", query.affinity);
  const suffix = parameters.size > 0 ? `?${parameters.toString()}` : "";
  const response = await apiRequest<AshOfWar>(`/ashes-of-war${suffix}`);

  return {
    ...response,
    data: response.data.map((ashOfWar) => ({
      ...ashOfWar,
      iconUrl: resolveApiAssetUrl(ashOfWar.iconUrl),
    })),
  };
}
