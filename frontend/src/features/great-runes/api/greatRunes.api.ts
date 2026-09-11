import { apiRequest } from "../../../shared/api/apiClient";
import { resolveApiAssetUrl } from "../../../shared/api/resolveApiAssetUrl";
import { greatRuneSchema } from "../schemas/greatRune.schemas";
import type { GreatRune } from "../types/greatRune.types";

export async function getGreatRunes() {
  const response = await apiRequest<GreatRune>("/great-runes", {
    responseSchema: greatRuneSchema,
  });
  return {
    ...response,
    data: response.data.map((greatRune) => ({
      ...greatRune,
      iconUrl: resolveApiAssetUrl(greatRune.iconUrl),
    })),
  };
}
