import { apiRequest } from "../../../shared/api/apiClient";
import type { Boss } from "../types/boss.types";

export function getBosses() {
  return apiRequest<Boss>("/bosses");
}
