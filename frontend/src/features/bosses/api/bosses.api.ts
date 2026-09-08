import { apiRequest } from "../../../shared/api/apiClient";
import type { Boss } from "../types/boss.types";
import type { BossCatalogSearch } from "../types/boss.types";

export interface BossQuery extends Partial<BossCatalogSearch> {
  page?: number;
  limit?: number;
}

export function getBosses(query: BossQuery = {}) {
  const parameters = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined && value !== "") parameters.set(key, String(value));
  }
  const suffix = parameters.size > 0 ? `?${parameters.toString()}` : "";
  return apiRequest<Boss>(`/bosses${suffix}`);
}

export function getBoss(bossId: string) {
  return apiRequest<Boss>(`/bosses/${bossId}`);
}
