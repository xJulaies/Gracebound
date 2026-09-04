import { createIconUrl } from "../../../shared/http/createIconUrl";
import type { GreatRuneRecord } from "../models/greatRune.model";

export function mapGreatRuneResponse(record: GreatRuneRecord) {
  return {
    id: record.id,
    name: record.name,
    summary: record.summary ?? null,
    description: record.description ?? null,
    iconId: record.iconId,
    iconUrl: createIconUrl(record.iconId),
    activation: record.activation,
    calculationStatus: record.calculationStatus,
    effects: record.effects,
    limitations: record.limitations,
    gameVersion: record.gameVersion,
  };
}
