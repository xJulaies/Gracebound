import { apiRequest } from "../../../shared/api/apiClient";
import { resolveApiAssetUrl } from "../../../shared/api/resolveApiAssetUrl";
import { identifierSchema } from "../../../shared/schemas/game.schemas";
import { talismanQuerySchema, talismanSchema } from "../schemas/talisman.schemas";
import type { Talisman } from "../types/talisman.types";

export interface TalismanQuery {
  search?: string;
  page?: number;
  limit?: number;
  calculationStatus?: "catalog-only" | "supported";
}

export async function getTalismans(query: TalismanQuery = {}) {
  const validatedQuery = talismanQuerySchema.parse(query);
  const parameters = new URLSearchParams();
  if (validatedQuery.search) parameters.set("search", validatedQuery.search);
  if (validatedQuery.page !== undefined) parameters.set("page", String(validatedQuery.page));
  if (validatedQuery.limit !== undefined) parameters.set("limit", String(validatedQuery.limit));
  if (validatedQuery.calculationStatus) {
    parameters.set("calculationStatus", validatedQuery.calculationStatus);
  }
  const suffix = parameters.size > 0 ? `?${parameters.toString()}` : "";
  const response = await apiRequest<Talisman>(`/talismans${suffix}`, {
    responseSchema: talismanSchema,
  });

  return {
    ...response,
    data: response.data.map((talisman) => ({
      ...talisman,
      iconUrl: resolveApiAssetUrl(talisman.iconUrl),
    })),
  };
}

export async function getTalisman(talismanId: string) {
  const validatedId = identifierSchema.parse(talismanId);
  const response = await apiRequest<Talisman>(`/talismans/${encodeURIComponent(validatedId)}`, {
    responseSchema: talismanSchema,
  });
  return {
    ...response,
    data: response.data.map((talisman) => ({
      ...talisman,
      iconUrl: resolveApiAssetUrl(talisman.iconUrl),
    })),
  };
}
