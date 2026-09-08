import type { CharacterStats } from "../../../shared/types/game.types";

export function getHighlightedStats(stats: CharacterStats) {
  const entries = Object.entries(stats) as Array<[keyof CharacterStats, number]>;
  const distinctValues = new Set(entries.map(([, value]) => value));

  if (distinctValues.size === 1) return [];

  return entries
    .sort(([leftName, leftValue], [rightName, rightValue]) =>
      rightValue - leftValue || leftName.localeCompare(rightName))
    .slice(0, 3)
    .map(([name]) => name);
}
