import {
  INCANTATION_SCHOOLS,
  SORCERY_SCHOOLS,
  SPELL_SCHOOLS,
  SPELL_TYPES,
  type SpellCatalogSearch,
  type SpellSchool,
  type SpellTypeFilter,
} from "../types/spell.types";

export function parseSpellCatalogSearch(
  search: Record<string, unknown>,
): SpellCatalogSearch {
  const type = isSpellType(search.type) ? search.type : "all";
  const school = isSpellSchool(search.school) ? search.school : undefined;

  return {
    type,
    search: typeof search.search === "string" ? search.search.slice(0, 100) : "",
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

function isSpellType(value: unknown): value is SpellTypeFilter {
  return typeof value === "string" && SPELL_TYPES.some((type) => type === value);
}

function isSpellSchool(value: unknown): value is SpellSchool {
  return typeof value === "string" && SPELL_SCHOOLS.some((school) => school === value);
}
