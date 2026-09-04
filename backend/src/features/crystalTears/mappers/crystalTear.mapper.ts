import { createIconUrl } from "../../../shared/http/createIconUrl";
import type { CrystalTearRecord } from "../models/crystalTear.model";
export function mapCrystalTearResponse(tear: CrystalTearRecord) {
  return { id: tear.id, name: tear.name, summary: tear.summary ?? null, description: tear.description ?? null, iconId: tear.iconId, iconUrl: createIconUrl(tear.iconId), calculationStatus: tear.calculationStatus, effects: tear.effects, limitations: tear.limitations, gameVersion: tear.gameVersion };
}
