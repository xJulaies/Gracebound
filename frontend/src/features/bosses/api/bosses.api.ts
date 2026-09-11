import { apiRequest } from "../../../shared/api/apiClient";
import type { Boss } from "../types/boss.types";
import type { BossCatalogSearch } from "../types/boss.types";
import { resolveApiAssetUrl } from "../../../shared/api/resolveApiAssetUrl";
import { identifierSchema } from "../../../shared/schemas/game.schemas";
import { bossQuerySchema, bossSchema } from "../schemas/boss.schemas";

export interface BossQuery extends Partial<BossCatalogSearch> {
  page?: number;
  limit?: number;
}

export async function getBosses(query: BossQuery = {}) {
  const validatedQuery = bossQuerySchema.parse(query);
  const parameters = new URLSearchParams();
  for (const [key, value] of Object.entries(validatedQuery)) {
    if (value !== undefined && value !== "") parameters.set(key, String(value));
  }
  const suffix = parameters.size > 0 ? `?${parameters.toString()}` : "";
  const response = await apiRequest<Boss>(`/bosses${suffix}`, { responseSchema: bossSchema });
  return { ...response, data: response.data.map(resolveBossAssets) };
}

export async function getBoss(bossId: string) {
  const validatedId = identifierSchema.parse(bossId);
  const response = await apiRequest<Boss>(`/bosses/${encodeURIComponent(validatedId)}`, {
    responseSchema: bossSchema,
  });
  return { ...response, data: response.data.map(resolveBossAssets) };
}

function resolveBossAssets(boss: Boss): Boss {
  return {
    ...boss,
    imageUrl: boss.imageUrl ? resolveApiAssetUrl(boss.imageUrl) : null,
    phases: boss.phases?.map((phase) => ({
      ...phase,
      imageUrl: phase.imageUrl ? resolveApiAssetUrl(phase.imageUrl) : null,
    })),
  };
}
