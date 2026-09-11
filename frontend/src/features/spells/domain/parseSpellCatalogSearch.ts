import {
  INCANTATION_SCHOOLS,
  SORCERY_SCHOOLS,
  SPELL_SCHOOLS,
  SPELL_TYPES,
  type SpellCatalogSearch,
  type SpellSchool,
  type SpellTypeFilter,
} from "../types/spell.types";
import { z } from "zod";

const spellCatalogSearchSchema = z.object({
  type: z.enum(SPELL_TYPES).catch("all"),
  school: z.enum(SPELL_SCHOOLS).optional().catch(undefined),
  search: z.preprocess(
    (value) => typeof value === "string" ? value.slice(0, 100) : "",
    z.string(),
  ),
});

export function parseSpellCatalogSearch(
  search: Record<string, unknown>,
): SpellCatalogSearch {
  const parsed = spellCatalogSearchSchema.parse(search);
  const { type, school } = parsed;

  return {
    type,
    search: parsed.search,
    ...(schoolIsAvailable(type, school) && { school }),
  };
}

function schoolIsAvailable(
  type: SpellTypeFilter,
  school: SpellSchool | undefined,
): school is SpellSchool {
  if (!school || type === "all") return false;
  const schools: readonly SpellSchool[] = type === "sorcery"
    ? SORCERY_SCHOOLS
    : INCANTATION_SCHOOLS;
  return schools.includes(school);
}
