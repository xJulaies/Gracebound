import type { SpellRecord } from "../models/spell.model";
import { createIconUrl } from "../../../shared/http/createIconUrl";

export function mapSpellResponse(spell: SpellRecord) {
  return {
    id: spell.id,
    name: spell.name,
    summary: spell.summary ?? null,
    description: spell.description ?? null,
    type: spell.type,
    schools: spell.schools ?? [],
    fpCost: spell.fpCost,
    chargedFpCost: spell.chargedFpCost,
    sustainedFpCost: spell.sustainedFpCost,
    slotsRequired: spell.slotsRequired,
    requirements: spell.requirements,
    iconId: spell.iconId,
    iconUrl: createIconUrl(spell.iconId),
    calculationStatus: spell.calculationStatus,
    buffEffect: spell.buffEffect,
    attack: spell.attack ? {
      outputUnit: spell.attack.outputUnit,
      motionValues: spell.attack.motionValues,
      additionalComponents: spell.attack.additionalComponents.map((component) => ({
        id: component.id,
        label: component.label,
        outputUnit: component.outputUnit,
        motionValues: component.motionValues,
      })),
    } : null,
    chargedAttack: spell.chargedAttack ? {
      outputUnit: spell.chargedAttack.outputUnit,
      motionValues: spell.chargedAttack.motionValues,
      additionalComponents: spell.chargedAttack.additionalComponents.map((component) => ({
        id: component.id,
        label: component.label,
        outputUnit: component.outputUnit,
        motionValues: component.motionValues,
      })),
    } : null,
    gameVersion: spell.gameVersion,
  };
}
