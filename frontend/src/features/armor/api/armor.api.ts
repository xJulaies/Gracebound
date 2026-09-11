import { apiRequest } from "../../../shared/api/apiClient";
import { resolveApiAssetUrl } from "../../../shared/api/resolveApiAssetUrl";
import { identifierSchema } from "../../../shared/schemas/game.schemas";
import { armorQuerySchema, armorSchema } from "../schemas/armor.schemas";
import type { Armor, ArmorSlot } from "../types/armor.types";

export interface ArmorQuery {
  slot?: ArmorSlot;
  search?: string;
  page?: number;
  limit?: number;
}

export async function getArmor(query: ArmorQuery = {}) {
  const validatedQuery = armorQuerySchema.parse(query);
  const parameters = new URLSearchParams();
  if (validatedQuery.slot) parameters.set("slot", validatedQuery.slot);
  if (validatedQuery.search) parameters.set("search", validatedQuery.search);
  if (validatedQuery.page !== undefined) parameters.set("page", String(validatedQuery.page));
  if (validatedQuery.limit !== undefined) parameters.set("limit", String(validatedQuery.limit));
  const suffix = parameters.size > 0 ? `?${parameters.toString()}` : "";
  const response = await apiRequest<Armor>(`/armor${suffix}`, { responseSchema: armorSchema });

  return {
    ...response,
    data: response.data.map((armor) => ({
      ...armor,
      iconUrl: resolveApiAssetUrl(armor.iconUrl),
    })),
  };
}

export async function getArmorPiece(armorId: string) {
  const validatedId = identifierSchema.parse(armorId);
  const response = await apiRequest<Armor>(`/armor/${encodeURIComponent(validatedId)}`, {
    responseSchema: armorSchema,
  });
  return {
    ...response,
    data: response.data.map((armor) => ({
      ...armor,
      iconUrl: resolveApiAssetUrl(armor.iconUrl),
    })),
  };
}
