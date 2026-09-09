import type { Boss } from "../types/boss.types";
import { formatBossLabel } from "./formatBossLabel";

export function formatBossSelectionLabel(boss: Boss): string {
  const encounter = boss.encounters[0];
  const location = encounter?.location ?? (encounter ? formatBossLabel(encounter.region) : "Unknown location");
  const region = encounter?.location
    ? ` · ${formatBossLabel(encounter.region)}`
    : "";

  return `${boss.name} — ${location}${region} · ${new Intl.NumberFormat("en").format(boss.health)} HP`;
}

export function formatCompactBossSelectionLabel(boss: Boss): string {
  const region = boss.encounters[0]
    ? ` · ${formatBossLabel(boss.encounters[0].region)}`
    : "";

  return `${boss.name}${region} · ${new Intl.NumberFormat("en").format(boss.health)} HP`;
}
