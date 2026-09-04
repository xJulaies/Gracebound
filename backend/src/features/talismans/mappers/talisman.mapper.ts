import type { TalismanRecord } from "../models/talisman.model";
import { createIconUrl } from "../../../shared/http/createIconUrl";

export function mapTalismanResponse(record: TalismanRecord) {
  return {
    id: record.id,
    name: record.name,
    summary: record.summary ?? null,
    description: record.description ?? null,
    iconId: record.iconId,
    iconUrl: createIconUrl(record.iconId),
    weight: record.weight,
    calculationStatus: record.calculationStatus,
    effects: record.effects,
    gameVersion: record.gameVersion,
  };
}
