import type { CharacterProgressionCurves } from "./characterResources.types";
import type { CharacterStats } from "./buildStats.types";

export function calculateCharacterProtection(
  level: number,
  stats: CharacterStats,
  curves: CharacterProgressionCurves,
) {
  const levelIndex = level + 79;
  const levelDefense = valueAt(curves.levelDefense, levelIndex);
  const status = (name: keyof CharacterProgressionCurves["statusLevel"], attribute: number) =>
    Math.floor(valueAt(curves.statusLevel[name], levelIndex) + valueAt(curves.statusAttribute[name], attribute));

  return {
    itemDiscovery: Math.floor(valueAt(curves.itemDiscovery, stats.arcane) * 100),
    defenses: {
      physical: Math.floor(levelDefense + valueAt(curves.physicalDefense, stats.strength)),
      magic: Math.floor(levelDefense + valueAt(curves.magicDefense, stats.intelligence)),
      fire: Math.floor(levelDefense + valueAt(curves.fireDefense, stats.vigor)),
      lightning: Math.floor(levelDefense),
      holy: Math.floor(levelDefense + valueAt(curves.holyDefense, stats.arcane)),
    },
    statusResistances: {
      poison: status("poison", stats.vigor),
      rot: status("rot", stats.vigor),
      bleed: status("bleed", stats.endurance),
      frost: status("frost", stats.endurance),
      sleep: status("sleep", stats.mind),
      madness: status("madness", stats.mind),
      deathBlight: status("deathBlight", stats.arcane),
    },
  };
}

function valueAt(curve: number[], index: number) {
  const value = curve[index];
  if (value === undefined) throw new Error(`Missing progression curve value at ${index}`);
  return value;
}
