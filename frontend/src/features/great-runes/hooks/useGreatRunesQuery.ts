import { useQuery } from "@tanstack/react-query";
import { getGreatRunes } from "../api/greatRunes.api";

export const greatRunesQueryKey = ["great-runes"] as const;

export function useGreatRunesQuery() {
  return useQuery({ queryKey: greatRunesQueryKey, queryFn: getGreatRunes });
}
