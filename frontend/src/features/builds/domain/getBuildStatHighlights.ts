import type { BuildStats } from "../types/build.types";

export interface BuildStatHighlight {
  label: string;
  value: number;
}

export function getBuildStatHighlights(stats: BuildStats) {
  return Object.entries(stats)
    .sort(([firstName, firstValue], [secondName, secondValue]) =>
      secondValue - firstValue || firstName.localeCompare(secondName),
    )
    .slice(0, 3)
    .map(([name, value]): BuildStatHighlight => ({
      label: name.charAt(0).toUpperCase() + name.slice(1),
      value,
    }));
}
