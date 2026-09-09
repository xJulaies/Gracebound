import { apiRequest } from "../../../shared/api/apiClient";
import type {
  DamageTrialResult,
  SavedBuildDamageRequest,
} from "../types/damageTrial.types";

type GetToken = () => Promise<string | null>;

export function calculateSavedBuildDamage(
  buildId: string,
  request: SavedBuildDamageRequest,
  getToken: GetToken,
  signal?: AbortSignal,
) {
  return apiRequest<DamageTrialResult>(
    `/me/builds/${encodeURIComponent(buildId)}/calculate-damage`,
    {
      method: "POST",
      body: JSON.stringify(request),
      getToken,
      signal,
    },
  );
}
