import { useQuery } from "@tanstack/react-query";
import { getHealth } from "../api/health.api";

export function useHealthQuery() {
  return useQuery({
    queryKey: ["health"],
    queryFn: getHealth,
    retry: false,
  });
}
