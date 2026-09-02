import { apiRequest } from "../../../shared/api/apiClient";
import type { CharacterClass } from "../types/characterClass.types";

export function getCharacterClasses() {
  return apiRequest<CharacterClass>("/character-classes");
}
