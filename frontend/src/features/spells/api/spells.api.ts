import { apiRequest } from "../../../shared/api/apiClient";
import { resolveApiAssetUrl } from "../../../shared/api/resolveApiAssetUrl";
import { identifierSchema } from "../../../shared/schemas/game.schemas";
import { spellQuerySchema, spellSchema } from "../schemas/spell.schemas";
import type { Spell, SpellSchool, SpellType } from "../types/spell.types";

export interface SpellQuery {
  type?: SpellType;
  school?: SpellSchool;
  search?: string;
  page?: number;
  limit?: number;
}

export async function getSpells(query: SpellQuery = {}) {
  const validatedQuery = spellQuerySchema.parse(query);
  const parameters = new URLSearchParams();
  if (validatedQuery.type) parameters.set("type", validatedQuery.type);
  if (validatedQuery.school) parameters.set("school", validatedQuery.school);
  if (validatedQuery.search) parameters.set("search", validatedQuery.search);
  if (validatedQuery.page !== undefined) parameters.set("page", String(validatedQuery.page));
  if (validatedQuery.limit !== undefined) parameters.set("limit", String(validatedQuery.limit));
  const suffix = parameters.size > 0 ? `?${parameters.toString()}` : "";
  const response = await apiRequest<Spell>(`/spells${suffix}`, { responseSchema: spellSchema });

  return {
    ...response,
    data: response.data.map((spell) => ({
      ...spell,
      iconUrl: resolveApiAssetUrl(spell.iconUrl),
    })),
  };
}

export async function getSpell(spellId: string) {
  const validatedId = identifierSchema.parse(spellId);
  const response = await apiRequest<Spell>(`/spells/${encodeURIComponent(validatedId)}`, {
    responseSchema: spellSchema,
  });
  return {
    ...response,
    data: response.data.map((spell) => ({
      ...spell,
      iconUrl: resolveApiAssetUrl(spell.iconUrl),
    })),
  };
}
