import { useInfiniteQuery } from "@tanstack/react-query";
import { getSpells, type SpellQuery } from "../api/spells.api";

export function useInfiniteSpellsQuery(query: Omit<SpellQuery, "page">) {
  return useInfiniteQuery({
    queryKey: ["spells", "infinite", query],
    queryFn: ({ pageParam }) => getSpells({ ...query, page: pageParam }),
    initialPageParam: 1,
    getNextPageParam: (lastPage, pages) => {
      const loadedCount = pages.reduce((total, page) => total + page.data.length, 0);
      return loadedCount < (lastPage.totalCount ?? loadedCount)
        ? pages.length + 1
        : undefined;
    },
  });
}
