import {
  INCANTATION_SCHOOLS,
  SORCERY_SCHOOLS,
  type SpellSchool,
  type SpellTypeFilter,
} from "../../types/spell.types";
import { formatSpellLabel } from "../../domain/formatSpellLabel";
import { ResponsiveSelect } from "../../../../shared/ui/molecules/ResponsiveSelect";

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
      <div className="max-w-xs">
        <ResponsiveSelect
          emptyLabel="All schools"
          label="School"
          onChange={(value) => onChange((value || undefined) as SpellSchool | undefined)}
          options={schools.map((option) => ({ value: option, label: formatSpellLabel(option) }))}
          value={school ?? ""}
        />
      </div>
    </fieldset>
  );
}
