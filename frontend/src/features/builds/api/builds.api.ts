import { apiRequest } from "../../../shared/api/apiClient";
import type {
  Build,
  BuildStatsInput,
  BuildStatsPreview,
} from "../types/build.types";

type GetToken = () => Promise<string | null>;

export function getPublicBuilds() {
  return apiRequest<Build>("/builds");
}

export function getOwnedBuilds(getToken: GetToken) {
  return apiRequest<Build>("/me/builds", { getToken });
}

export function calculateBuildStats(input: BuildStatsInput, signal?: AbortSignal) {
  return apiRequest<BuildStatsPreview>("/builds/calculate-stats", {
    method: "POST",
    body: JSON.stringify(input),
    signal,
  });
}
