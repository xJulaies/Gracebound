import type { BuildStats } from "../types/build.types";

export interface BuildStatHighlight {
  label: string;
  accessibleLabel: string;
  value: number;
}

const attributeLabels: Record<keyof BuildStats, { short: string; full: string }> = {
  vigor: { short: "VIG", full: "Vigor" },
  mind: { short: "MND", full: "Mind" },
  endurance: { short: "END", full: "Endurance" },
  strength: { short: "STR", full: "Strength" },
  dexterity: { short: "DEX", full: "Dexterity" },
  intelligence: { short: "INT", full: "Intelligence" },
  faith: { short: "FAI", full: "Faith" },
  arcane: { short: "ARC", full: "Arcane" },
};

export function getBuildStatHighlights(stats: BuildStats) {
  return Object.entries(stats)
    .sort(([firstName, firstValue], [secondName, secondValue]) =>
      secondValue - firstValue || firstName.localeCompare(secondName),
    )
    .slice(0, 3)
    .map(([name, value]): BuildStatHighlight => {
      const labels = attributeLabels[name as keyof BuildStats];
      return { label: labels.short, accessibleLabel: labels.full, value };
    });
}
