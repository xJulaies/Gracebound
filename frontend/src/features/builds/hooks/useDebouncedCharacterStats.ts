import { useDebouncedValue } from "../../../shared/hooks/useDebouncedValue";
import type { CharacterStats } from "../../../shared/types/game.types";

const DEFAULT_PREVIEW_DEBOUNCE_MS = 350;

export function useDebouncedCharacterStats(
  stats: CharacterStats | null,
  delay = DEFAULT_PREVIEW_DEBOUNCE_MS,
) {
  return useDebouncedValue(stats, delay);
}
