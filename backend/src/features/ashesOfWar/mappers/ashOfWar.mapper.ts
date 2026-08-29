import type { AshOfWarRecord } from "../models/ashOfWar.model";

export function mapAshOfWarResponse(record: AshOfWarRecord) {
  return {
    id: record.id,
    name: record.name,
    iconId: record.iconId,
    compatibleWeaponTypes: [...record.compatibleWeaponTypes],
    attacks: record.skill.attacks.map(({ id, name, fpCost }) => ({ id, name, fpCost })),
    gameVersion: record.gameVersion,
  };
}
