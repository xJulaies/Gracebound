import { apiRequest } from "../../../shared/api/apiClient";
import { resolveApiAssetUrl } from "../../../shared/api/resolveApiAssetUrl";
import { crystalTearSchema } from "../schemas/crystalTear.schemas";
import type { CrystalTear } from "../types/crystalTear.types";

export async function getCrystalTears() {
  const response = await apiRequest<CrystalTear>("/crystal-tears", {
    responseSchema: crystalTearSchema,
  });
  return {
    ...response,
    data: response.data.map((crystalTear) => ({
      ...crystalTear,
      iconUrl: resolveApiAssetUrl(crystalTear.iconUrl),
    })),
  };
}
