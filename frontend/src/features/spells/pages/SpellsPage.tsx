import { useDebouncedValue } from "../../../shared/hooks/useDebouncedValue";
import { SpellCatalogHeader } from "../components/organisms/SpellCatalogHeader";
import { SpellCatalogResults } from "../components/organisms/SpellCatalogResults";
import { useInfiniteSpellsQuery } from "../hooks/useSpellsQuery";
import type {
  SpellCatalogSearch,
  SpellSchool,
  SpellTypeFilter,
} from "../types/spell.types";

const CATALOG_PAGE_SIZE = 24;

export function SpellsPage({
  filters,
  onSchoolChange,
  onSearchChange,
  onTypeChange,
}: {
  filters: SpellCatalogSearch;
  onSchoolChange: (school: SpellSchool | undefined) => void;
  onSearchChange: (search: string) => void;
  onTypeChange: (type: SpellTypeFilter) => void;
}) {
  const search = useDebouncedValue(filters.search.trim(), 250);
  const query = useInfiniteSpellsQuery({
    limit: CATALOG_PAGE_SIZE,
    ...(filters.type !== "all" && { type: filters.type }),
    ...(filters.school && { school: filters.school }),
    ...(search && { search }),
  });
  const spells = query.data?.pages.flatMap(({ data }) => data) ?? [];

  return (
    <main>
      <SpellCatalogHeader
        filters={filters}
        onSchoolChange={onSchoolChange}
        onSearchChange={onSearchChange}
        onTypeChange={onTypeChange}
      />
      <SpellCatalogResults
        hasNextPage={query.hasNextPage}
        isError={query.isError}
        isFetchingNextPage={query.isFetchingNextPage}
        isPending={query.isPending}
        onLoadMore={() => { void query.fetchNextPage(); }}
        spells={spells}
      />
    </main>
  );
}
