import { apiRequest } from "../../../shared/api/apiClient";
import type { CrystalTear } from "../types/crystalTear.types";

export function getCrystalTears() {
  return apiRequest<CrystalTear>("/crystal-tears");
}
