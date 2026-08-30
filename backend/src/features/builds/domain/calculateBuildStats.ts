import type {
  BuildStatTalismanEffects,
  CharacterStats,
} from "./buildStats.types";

const ATTRIBUTE_CAP = 99;

export function calculateBuildStats(
  stats: CharacterStats,
  talismanEffects: BuildStatTalismanEffects[],
) {
  return {
    stats,
    effectiveStats: applyAttributeBonuses(stats, talismanEffects),
    resourceMultipliers: talismanEffects.reduce(
      (total, effect) => ({
        maxHp: multiply(total.maxHp, effect.resourceMultipliers.maxHp),
        maxFp: multiply(total.maxFp, effect.resourceMultipliers.maxFp),
        maxStamina: multiply(total.maxStamina, effect.resourceMultipliers.maxStamina),
        maxEquipLoad: multiply(total.maxEquipLoad, effect.resourceMultipliers.maxEquipLoad),
      }),
      { maxHp: 1, maxFp: 1, maxStamina: 1, maxEquipLoad: 1 },
    ),
    statusResistanceBonuses: talismanEffects.reduce(
      (total, effect) => ({
        poison: total.poison + effect.statusResistanceBonuses.poison,
        rot: total.rot + effect.statusResistanceBonuses.rot,
        bleed: total.bleed + effect.statusResistanceBonuses.bleed,
        frost: total.frost + effect.statusResistanceBonuses.frost,
        sleep: total.sleep + effect.statusResistanceBonuses.sleep,
        madness: total.madness + effect.statusResistanceBonuses.madness,
        deathBlight: total.deathBlight + effect.statusResistanceBonuses.deathBlight,
      }),
      { poison: 0, rot: 0, bleed: 0, frost: 0, sleep: 0, madness: 0, deathBlight: 0 },
    ),
    itemDiscoveryBonus: talismanEffects.reduce(
      (total, effect) => total + Math.round(effect.utilityEffects.itemDiscoveryRateBonus * 100),
      0,
    ),
    incomingDamageMultipliers: talismanEffects.reduce(
      (total, effect) => ({
        physical: multiply(total.physical, effect.incomingDamageMultipliers.physical),
        magic: multiply(total.magic, effect.incomingDamageMultipliers.magic),
        fire: multiply(total.fire, effect.incomingDamageMultipliers.fire),
        lightning: multiply(total.lightning, effect.incomingDamageMultipliers.lightning),
        holy: multiply(total.holy, effect.incomingDamageMultipliers.holy),
      }),
      { physical: 1, magic: 1, fire: 1, lightning: 1, holy: 1 },
    ),
  };
}

export function applyAttributeBonuses<T extends Partial<CharacterStats>>(
  stats: T,
  talismanEffects: Pick<TalismanEffectsForAttributes, "attributeBonuses">[],
): T {
  const effectiveStats = { ...stats };
  for (const key of Object.keys(stats) as Array<keyof T & keyof CharacterStats>) {
    const bonus = talismanEffects.reduce(
      (total, effect) => total + effect.attributeBonuses[key],
      0,
    );
    effectiveStats[key] = Math.min(ATTRIBUTE_CAP, stats[key]! + bonus) as T[typeof key];
  }
  return effectiveStats;
}

type TalismanEffectsForAttributes = Pick<BuildStatTalismanEffects, "attributeBonuses">;

function multiply(left: number, right: number) {
  return Number((left * right).toFixed(12));
}
