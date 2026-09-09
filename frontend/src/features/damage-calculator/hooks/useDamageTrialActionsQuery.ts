import { useQuery } from "@tanstack/react-query";
import type { Build } from "../../builds/types/build.types";
import { getDamageTrialActionOptions } from "../api/damageTrialLoadout.api";

export function useDamageTrialActionsQuery(build: Build | null) {
  return useQuery({
    queryKey: ["damage-trial", "actions", build?.id, build?.updatedAt],
    queryFn: () => getDamageTrialActionOptions(build!),
    enabled: build !== null,
    staleTime: Infinity,
  });
}
