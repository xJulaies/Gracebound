import type { ArmorData } from "../../armor/domain/armor.types";

export function calculateArmorStats(armor: ArmorData[]) {
  const slots = new Set(armor.map(({ slot }) => slot));
  if (slots.size !== armor.length) throw new Error("Only one armor piece per slot is allowed");

  return {
    equipmentWeight: round(armor.reduce((total, item) => total + item.weight, 0)),
    poise: round(armor.reduce((total, item) => total + item.poise, 0)),
    damageNegation: combineDamageNegation(armor),
    resistanceBonuses: armor.reduce((total, item) => ({
      poison: total.poison + item.resistances.poison,
      rot: total.rot + item.resistances.rot,
      bleed: total.bleed + item.resistances.bleed,
      frost: total.frost + item.resistances.frost,
      sleep: total.sleep + item.resistances.sleep,
      madness: total.madness + item.resistances.madness,
      deathBlight: total.deathBlight + item.resistances.deathBlight,
    }), { poison: 0, rot: 0, bleed: 0, frost: 0, sleep: 0, madness: 0, deathBlight: 0 }),
    hasUnresolvedPassiveEffects: armor.some(({ sourceEffectIds }) => sourceEffectIds.length > 0),
  };
}

function combineDamageNegation(armor: ArmorData[]) {
  const keys = ["physical", "strike", "slash", "pierce", "magic", "fire", "lightning", "holy"] as const;
  return Object.fromEntries(keys.map((key) => [
    key,
    round(1 - armor.reduce((multiplier, item) => multiplier * (1 - item.damageNegation[key]), 1)),
  ])) as Record<typeof keys[number], number>;
}

function round(value: number) {
  return Number(value.toFixed(6));
}
