import { useQuery } from "@tanstack/react-query";
import { getBosses } from "../api/bosses.api";

export const bossesQueryKey = ["bosses"] as const;

export function useBossesQuery() {
  return useQuery({ queryKey: bossesQueryKey, queryFn: getBosses });
}
