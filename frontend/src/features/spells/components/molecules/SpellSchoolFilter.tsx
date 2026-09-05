import {
  INCANTATION_SCHOOLS,
  SORCERY_SCHOOLS,
  type SpellSchool,
  type SpellTypeFilter,
} from "../../types/spell.types";
import { formatSpellLabel } from "../../domain/formatSpellLabel";

export function SpellSchoolFilter({
  onChange,
  school,
  type,
}: {
  onChange: (school: SpellSchool | undefined) => void;
  school?: SpellSchool;
  type: SpellTypeFilter;
}) {
  if (type === "all") return null;
  const schools = type === "sorcery" ? SORCERY_SCHOOLS : INCANTATION_SCHOOLS;

  return (
    <fieldset className="m-0 border-0 p-0">
      <legend className="sr-only">Spell filters</legend>
      <label className="grid max-w-xs gap-1 text-sm text-foreground-muted">
        School
        <select
          className="min-h-11 cursor-pointer rounded-panel border border-border bg-background px-3 text-foreground outline-none focus:border-accent focus:ring-2 focus:ring-focus"
          onChange={(event) => onChange(
            (event.currentTarget.value || undefined) as SpellSchool | undefined,
          )}
          value={school ?? ""}
        >
          <option value="">All schools</option>
          {schools.map((option) => (
            <option key={option} value={option}>{formatSpellLabel(option)}</option>
          ))}
        </select>
      </label>
    </fieldset>
  );
}
