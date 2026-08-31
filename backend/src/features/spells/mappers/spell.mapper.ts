import type { SpellRecord } from "../models/spell.model";

export function mapSpellResponse(spell: SpellRecord) {
  return {
    id: spell.id,
    name: spell.name,
    type: spell.type,
    fpCost: spell.fpCost,
    slotsRequired: spell.slotsRequired,
    requirements: spell.requirements,
    iconId: spell.iconId,
    calculationStatus: spell.calculationStatus,
    attack: spell.attack ? { motionValues: spell.attack.motionValues } : null,
    gameVersion: spell.gameVersion,
  };
}
