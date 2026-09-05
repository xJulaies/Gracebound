import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { getArmor, type ArmorQuery } from "../api/armor.api";

export function useArmorQuery(query: ArmorQuery, enabled = true) {
  return useQuery({
    queryKey: ["armor", query],
    queryFn: () => getArmor(query),
    enabled,
  });
}

export function useInfiniteArmorQuery(
  query: Omit<ArmorQuery, "page">,
  enabled = true,
) {
  return useInfiniteQuery({
    queryKey: ["armor", "infinite", query],
    queryFn: ({ pageParam }) => getArmor({ ...query, page: pageParam }),
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
