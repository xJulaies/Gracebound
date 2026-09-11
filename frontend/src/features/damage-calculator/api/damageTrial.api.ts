import { apiRequest } from "../../../shared/api/apiClient";
import { identifierSchema } from "../../../shared/schemas/game.schemas";
import {
  damageTrialResultSchema,
  savedBuildDamageRequestSchema,
} from "../schemas/damageTrial.schemas";
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
  const validatedBuildId = identifierSchema.parse(buildId);
  const validatedRequest = savedBuildDamageRequestSchema.parse(request);
  return apiRequest<DamageTrialResult>(
    `/me/builds/${encodeURIComponent(validatedBuildId)}/calculate-damage`,
    {
      method: "POST",
      body: JSON.stringify(validatedRequest),
      getToken,
      signal,
      responseSchema: damageTrialResultSchema,
    },
  );
}
