import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { getBoss, getBosses, type BossQuery } from "../api/bosses.api";

export const bossesQueryKey = ["bosses"] as const;

export function useBossesQuery() {
  return useQuery({ queryKey: bossesQueryKey, queryFn: () => getBosses() });
}

export function useInfiniteBossesQuery(query: Omit<BossQuery, "page">) {
  return useInfiniteQuery({
    queryKey: ["bosses", "infinite", query],
    queryFn: ({ pageParam }) => getBosses({ ...query, page: pageParam }),
    initialPageParam: 1,
    getNextPageParam: (lastPage, pages) => {
      const loaded = pages.reduce((sum, page) => sum + page.data.length, 0);
      return loaded < (lastPage.totalCount ?? loaded) ? pages.length + 1 : undefined;
    },
  });
}

export function useBossQuery(bossId: string) {
  return useQuery({
    queryKey: ["bosses", "detail", bossId],
    queryFn: () => getBoss(bossId),
  });
}
