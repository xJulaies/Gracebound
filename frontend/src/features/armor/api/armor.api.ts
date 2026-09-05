import { apiRequest } from "../../../shared/api/apiClient";
import { resolveApiAssetUrl } from "../../../shared/api/resolveApiAssetUrl";
import type { Armor, ArmorSlot } from "../types/armor.types";

export interface ArmorQuery {
  slot?: ArmorSlot;
  search?: string;
  page?: number;
  limit?: number;
}

export async function getArmor(query: ArmorQuery = {}) {
  const parameters = new URLSearchParams();
  if (query.slot) parameters.set("slot", query.slot);
  if (query.search) parameters.set("search", query.search);
  if (query.page !== undefined) parameters.set("page", String(query.page));
  if (query.limit !== undefined) parameters.set("limit", String(query.limit));
  const suffix = parameters.size > 0 ? `?${parameters.toString()}` : "";
  const response = await apiRequest<Armor>(`/armor${suffix}`);

  return {
    ...response,
    data: response.data.map((armor) => ({
      ...armor,
      iconUrl: resolveApiAssetUrl(armor.iconUrl),
    })),
  };
}
