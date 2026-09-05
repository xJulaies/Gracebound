import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { getTalismans, type TalismanQuery } from "../api/talismans.api";

export function useTalismansQuery(enabled = true) {
  return useQuery({
    queryKey: ["talismans"],
    queryFn: () => getTalismans(),
    enabled,
  });
}

export function useInfiniteTalismansQuery(
  query: Omit<TalismanQuery, "page">,
  enabled = true,
) {
  return useInfiniteQuery({
    queryKey: ["talismans", "infinite", query],
    queryFn: ({ pageParam }) => getTalismans({ ...query, page: pageParam }),
    initialPageParam: 1,
    getNextPageParam: (lastPage, pages) => {
      const loadedCount = pages.reduce((total, page) => total + page.data.length, 0);
      return loadedCount < (lastPage.totalCount ?? loadedCount)
        ? pages.length + 1
        : undefined;
    },
    enabled,
  });
}
