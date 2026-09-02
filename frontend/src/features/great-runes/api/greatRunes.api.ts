import { apiRequest } from "../../../shared/api/apiClient";
import type { GreatRune } from "../types/greatRune.types";

export function getGreatRunes() {
  return apiRequest<GreatRune>("/great-runes");
}
