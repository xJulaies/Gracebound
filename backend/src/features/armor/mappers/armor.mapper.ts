import type { ArmorRecord } from "../models/armor.model";

export function mapArmorResponse(armor: ArmorRecord) {
  return {
    id: armor.id,
    name: armor.name,
    slot: armor.slot,
    iconId: armor.iconId,
    weight: armor.weight,
    poise: armor.poise,
    damageNegation: armor.damageNegation,
    resistances: armor.resistances,
    hasPassiveEffects: armor.sourceEffectIds.length > 0,
    gameVersion: armor.gameVersion,
  };
}
