import type { TalismanRecord } from "../models/talisman.model";

export function mapTalismanResponse(record: TalismanRecord) {
  return {
    id: record.id,
    name: record.name,
    iconId: record.iconId,
    weight: record.weight,
    calculationStatus: record.calculationStatus,
    effects: record.effects,
    gameVersion: record.gameVersion,
  };
}
