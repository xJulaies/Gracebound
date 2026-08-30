import type { CharacterStats } from "./buildStats.types";
import type { CharacterResourceCurves, CharacterResources } from "./characterResources.types";

export function calculateBaseCharacterResources(
  stats: CharacterStats,
  curves: CharacterResourceCurves,
): CharacterResources {
  return {
    maxHp: valueAt(curves.maxHp, stats.vigor),
    maxFp: valueAt(curves.maxFp, stats.mind),
    maxStamina: valueAt(curves.maxStamina, stats.endurance),
    maxEquipLoad: valueAt(curves.maxEquipLoad, stats.endurance),
  };
}

export function applyResourceMultipliers(
  resources: CharacterResources,
  multipliers: CharacterResources,
): CharacterResources {
  return {
    maxHp: Math.floor(resources.maxHp * multipliers.maxHp),
    maxFp: Math.floor(resources.maxFp * multipliers.maxFp),
    maxStamina: Math.floor(resources.maxStamina * multipliers.maxStamina),
    maxEquipLoad: roundToSingleDecimal(resources.maxEquipLoad * multipliers.maxEquipLoad),
  };
}

function valueAt(curve: number[], attribute: number) {
  const value = curve[attribute];
  if (value === undefined) throw new Error(`Missing resource curve value for attribute ${attribute}`);
  return value;
}

function roundToSingleDecimal(value: number) {
  return Math.floor(value * 10) / 10;
}
