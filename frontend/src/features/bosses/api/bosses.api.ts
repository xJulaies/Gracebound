import { apiRequest } from "../../../shared/api/apiClient";
import type { Boss } from "../types/boss.types";
import type { BossCatalogSearch } from "../types/boss.types";
import { resolveApiAssetUrl } from "../../../shared/api/resolveApiAssetUrl";

export interface BossQuery extends Partial<BossCatalogSearch> {
  page?: number;
  limit?: number;
}

export async function getBosses(query: BossQuery = {}) {
  const parameters = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined && value !== "") parameters.set(key, String(value));
  }
  const suffix = parameters.size > 0 ? `?${parameters.toString()}` : "";
  const response = await apiRequest<Boss>(`/bosses${suffix}`);
  return { ...response, data: response.data.map(resolveBossAssets) };
}

export async function getBoss(bossId: string) {
  const response = await apiRequest<Boss>(`/bosses/${bossId}`);
  return { ...response, data: response.data.map(resolveBossAssets) };
}

function resolveBossAssets(boss: Boss): Boss {
  return {
    ...boss,
    imageUrl: boss.imageUrl ? resolveApiAssetUrl(boss.imageUrl) : null,
  };
}
