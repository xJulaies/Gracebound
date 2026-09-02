import { useQuery } from "@tanstack/react-query";
import { getWeapons, type WeaponQuery } from "../api/weapons.api";

export const weaponsQueryKey = (query: WeaponQuery) => ["weapons", query] as const;

export function useWeaponsQuery(query: WeaponQuery = {}) {
  return useQuery({
    queryKey: weaponsQueryKey(query),
    queryFn: () => getWeapons(query),
  });
}
