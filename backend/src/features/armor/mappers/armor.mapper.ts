import type { ArmorRecord } from "../models/armor.model";
import { createIconUrl } from "../../../shared/http/createIconUrl";

export function mapArmorResponse(armor: ArmorRecord) {
  return {
    id: armor.id,
    name: armor.name,
    slot: armor.slot,
    iconId: armor.iconId,
    iconUrl: createIconUrl(armor.iconId),
    weight: armor.weight,
    poise: armor.poise,
    damageNegation: armor.damageNegation,
    resistances: armor.resistances,
    hasPassiveEffects: armor.sourceEffectIds.length > 0,
    hasUnresolvedPassiveEffects: armor.hasUnresolvedPassiveEffects,
    passiveEffects: armor.passiveEffects,
    gameVersion: armor.gameVersion,
  };
}
