import { apiRequest } from "../../../shared/api/apiClient";
import { resolveApiAssetUrl } from "../../../shared/api/resolveApiAssetUrl";
import type { GreatRune } from "../types/greatRune.types";

export async function getGreatRunes() {
  const response = await apiRequest<GreatRune>("/great-runes");
  return {
    ...response,
    data: response.data.map((greatRune) => ({
      ...greatRune,
      iconUrl: resolveApiAssetUrl(greatRune.iconUrl),
    })),
  };
}
