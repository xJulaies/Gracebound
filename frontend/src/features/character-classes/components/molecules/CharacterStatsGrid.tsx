import type { CharacterStats } from "../../../../shared/types/game.types";
import { getHighlightedStats } from "../../domain/getHighlightedStats";

const STAT_LABELS: Record<keyof CharacterStats, string> = {
  vigor: "Vigor",
  mind: "Mind",
  endurance: "Endurance",
  strength: "Strength",
  dexterity: "Dexterity",
  intelligence: "Intelligence",
  faith: "Faith",
  arcane: "Arcane",
};

export function CharacterStatsGrid({ stats }: { stats: CharacterStats }) {
  const highlightedStats = new Set(getHighlightedStats(stats));

  return (
    <div className="grid grid-cols-2 gap-x-5 gap-y-2 border-t border-border p-4 sm:grid-cols-4">
      {Object.entries(stats).map(([stat, value]) => {
        const statName = stat as keyof CharacterStats;
        const highlighted = highlightedStats.has(statName);
        return (
          <div className="flex items-baseline justify-between gap-2" key={stat}>
            <span className={highlighted ? "text-accent" : "text-foreground-muted"}>
              {STAT_LABELS[statName]}
            </span>
            <strong className="tabular-nums">{value}</strong>
          </div>
        );
      })}
    </div>
  );
}
