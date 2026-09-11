import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { calculateBuildStats } from "../api/builds.api";
import { buildStatsInputSchema } from "../schemas/build.schemas";
import type { BuildStatsInput } from "../types/build.types";

const DEFAULT_DEBOUNCE_MS = 350;

export function useBuildStatsPreviewQuery(
  input: BuildStatsInput | null,
  debounceMs = DEFAULT_DEBOUNCE_MS,
) {
  const serializedInput = input ? JSON.stringify(input) : null;
  const [debouncedInput, setDebouncedInput] = useState(serializedInput);

  useEffect(() => {
    const timeout = window.setTimeout(
      () => setDebouncedInput(serializedInput),
      debounceMs,
    );

    return () => window.clearTimeout(timeout);
  }, [debounceMs, serializedInput]);

  const requestInput = useMemo(
    () =>
      debouncedInput
        ? buildStatsInputSchema.parse(JSON.parse(debouncedInput))
        : null,
    [debouncedInput],
  );

  return useQuery({
    queryKey: ["build-stats-preview", requestInput],
    queryFn: ({ signal }) => calculateBuildStats(requestInput!, signal),
    enabled: requestInput !== null,
    placeholderData: keepPreviousData,
    staleTime: Infinity,
  });
}
