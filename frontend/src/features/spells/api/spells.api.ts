import { apiRequest } from "../../../shared/api/apiClient";
import { resolveApiAssetUrl } from "../../../shared/api/resolveApiAssetUrl";
import type { Spell, SpellSchool, SpellType } from "../types/spell.types";

export interface SpellQuery {
  type?: SpellType;
  school?: SpellSchool;
  search?: string;
  page?: number;
  limit?: number;
}

export async function getSpells(query: SpellQuery = {}) {
  const parameters = new URLSearchParams();
  if (query.type) parameters.set("type", query.type);
  if (query.school) parameters.set("school", query.school);
  if (query.search) parameters.set("search", query.search);
  if (query.page !== undefined) parameters.set("page", String(query.page));
  if (query.limit !== undefined) parameters.set("limit", String(query.limit));
  const suffix = parameters.size > 0 ? `?${parameters.toString()}` : "";
  const response = await apiRequest<Spell>(`/spells${suffix}`);

  return {
    ...response,
    data: response.data.map((spell) => ({
      ...spell,
      iconUrl: resolveApiAssetUrl(spell.iconUrl),
    })),
  };
}
