import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { getWeapons, type WeaponQuery } from "../api/weapons.api";

export const weaponsQueryKey = (query: WeaponQuery) => ["weapons", query] as const;

export function useWeaponsQuery(query: WeaponQuery = {}, enabled = true) {
  return useQuery({
    queryKey: weaponsQueryKey(query),
    queryFn: () => getWeapons(query),
    enabled,
  });
}

export function useInfiniteWeaponsQuery(
  query: Omit<WeaponQuery, "page">,
  enabled = true,
) {
  return useInfiniteQuery({
    queryKey: ["weapons", "infinite", query],
    queryFn: ({ pageParam }) => getWeapons({ ...query, page: pageParam }),
    initialPageParam: 1,
    getNextPageParam: getNextPage,
    enabled,
  });
}

function getNextPage(
  lastPage: Awaited<ReturnType<typeof getWeapons>>,
  pages: Array<Awaited<ReturnType<typeof getWeapons>>>,
) {
  const loadedCount = pages.reduce((total, page) => total + page.data.length, 0);
  return loadedCount < (lastPage.totalCount ?? loadedCount)
    ? pages.length + 1
    : undefined;
}
