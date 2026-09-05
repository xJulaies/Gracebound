import { useQuery } from "@tanstack/react-query";
import { getAshesOfWar, type AshOfWarQuery } from "../api/ashesOfWar.api";

export function useAshesOfWarQuery(query: AshOfWarQuery, enabled = true) {
  return useQuery({
    queryKey: ["ashes-of-war", query],
    queryFn: () => getAshesOfWar(query),
    enabled,
  });
}
