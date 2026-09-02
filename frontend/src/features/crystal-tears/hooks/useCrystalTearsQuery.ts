import { useQuery } from "@tanstack/react-query";
import { getCrystalTears } from "../api/crystalTears.api";

export const crystalTearsQueryKey = ["crystal-tears"] as const;

export function useCrystalTearsQuery() {
  return useQuery({ queryKey: crystalTearsQueryKey, queryFn: getCrystalTears });
}
