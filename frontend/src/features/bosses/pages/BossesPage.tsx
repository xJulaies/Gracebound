import { useDebouncedValue } from "../../../shared/hooks/useDebouncedValue";
import { BossCatalogHeader } from "../components/organisms/BossCatalogHeader";
import { BossCatalogResults } from "../components/organisms/BossCatalogResults";
import { useInfiniteBossesQuery } from "../hooks/useBossesQuery";
import type { BossCatalogSearch, BossFilterKey } from "../types/boss.types";

const PAGE_SIZE = 24;

export function BossesPage({ filters, onFilterChange, onSearchChange }: {
  filters: BossCatalogSearch;
  onFilterChange: (key: BossFilterKey, value: BossCatalogSearch[BossFilterKey]) => void;
  onSearchChange: (search: string) => void;
}) {
  const search = useDebouncedValue(filters.search.trim(), 250);
  const query = useInfiniteBossesQuery({
    limit: PAGE_SIZE,
    ...(search && { search }),
    ...(filters.region && { region: filters.region }),
    ...(filters.locationType && { locationType: filters.locationType }),
    ...(filters.rank && { rank: filters.rank }),
    ...(filters.progression && { progression: filters.progression }),
    ...(filters.rewardsGreatRune !== undefined && {
      rewardsGreatRune: filters.rewardsGreatRune,
    }),
    ...(filters.rewardsRemembrance !== undefined && {
      rewardsRemembrance: filters.rewardsRemembrance,
    }),
  });
  const bosses = query.data?.pages.flatMap(({ data }) => data) ?? [];

  return (
    <main>
      <BossCatalogHeader
        filters={filters}
        onFilterChange={onFilterChange}
        onSearchChange={onSearchChange}
      />
      <BossCatalogResults
        bosses={bosses}
        hasNextPage={query.hasNextPage}
        isError={query.isError}
        isFetchingNextPage={query.isFetchingNextPage}
        isPending={query.isPending}
        onLoadMore={() => { void query.fetchNextPage(); }}
      />
    </main>
  );
}
