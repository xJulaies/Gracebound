import type { CharacterStats } from "../../../shared/types/game.types";

export function getHighlightedStats(stats: CharacterStats) {
  return (Object.entries(stats) as Array<[keyof CharacterStats, number]>)
    .sort(([leftName, leftValue], [rightName, rightValue]) =>
      rightValue - leftValue || leftName.localeCompare(rightName))
    .slice(0, 3)
    .map(([name]) => name);
}
