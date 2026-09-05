import { apiRequest } from "../../../shared/api/apiClient";
import { resolveApiAssetUrl } from "../../../shared/api/resolveApiAssetUrl";
import type { Talisman } from "../types/talisman.types";

export interface TalismanQuery {
  search?: string;
  page?: number;
  limit?: number;
  calculationStatus?: "catalog-only" | "supported";
}

export async function getTalismans(query: TalismanQuery = {}) {
  const parameters = new URLSearchParams();
  if (query.search) parameters.set("search", query.search);
  if (query.page !== undefined) parameters.set("page", String(query.page));
  if (query.limit !== undefined) parameters.set("limit", String(query.limit));
  if (query.calculationStatus) {
    parameters.set("calculationStatus", query.calculationStatus);
  }
  const suffix = parameters.size > 0 ? `?${parameters.toString()}` : "";
  const response = await apiRequest<Talisman>(`/talismans${suffix}`);

  return {
    ...response,
    data: response.data.map((talisman) => ({
      ...talisman,
      iconUrl: resolveApiAssetUrl(talisman.iconUrl),
    })),
  };
}
