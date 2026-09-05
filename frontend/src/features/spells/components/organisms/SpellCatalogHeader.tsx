import type {
  SpellCatalogSearch,
  SpellSchool,
  SpellTypeFilter as SpellType,
} from "../../types/spell.types";
import { SpellCatalogSearchInput } from "../atoms/SpellCatalogSearchInput";
import { SpellSchoolFilter } from "../molecules/SpellSchoolFilter";
import { SpellTypeFilter } from "../molecules/SpellTypeFilter";

export function SpellCatalogHeader({
  filters,
  onSchoolChange,
  onSearchChange,
  onTypeChange,
}: {
  filters: SpellCatalogSearch;
  onSchoolChange: (school: SpellSchool | undefined) => void;
  onSearchChange: (search: string) => void;
  onTypeChange: (type: SpellType) => void;
}) {
  return (
    <header className="mb-8 pt-6">
      <h1 className="mb-3 text-3xl sm:text-4xl">Spells</h1>
      <p className="mb-6 max-w-3xl leading-7 text-foreground-muted">
        Browse sorceries and incantations from the current Gracebound game dataset.
      </p>
      <div className="grid gap-4 rounded-panel border border-border bg-surface-elevated p-4 sm:p-5">
        <SpellCatalogSearchInput onChange={onSearchChange} value={filters.search} />
        <SpellTypeFilter activeType={filters.type} onChange={onTypeChange} />
        <SpellSchoolFilter
          onChange={onSchoolChange}
          school={filters.school}
          type={filters.type}
        />
      </div>
    </header>
  );
}
