import { apiRequest } from "../../../shared/api/apiClient";
import type {
  Build,
  BuildStatsInput,
  BuildStatsPreview,
  BuildWriteInput,
} from "../types/build.types";

type GetToken = () => Promise<string | null>;

export function getPublicBuilds() {
  return apiRequest<Build>("/builds");
}

export function getPublicBuild(buildId: string) {
  return apiRequest<Build>(`/builds/${encodeURIComponent(buildId)}`);
}

export function getOwnedBuilds(getToken: GetToken) {
  return apiRequest<Build>("/me/builds", { getToken });
}

export function getOwnedBuild(buildId: string, getToken: GetToken) {
  return apiRequest<Build>(`/me/builds/${encodeURIComponent(buildId)}`, { getToken });
}

export function createOwnedBuild(input: BuildWriteInput, getToken: GetToken) {
  return apiRequest<Build>("/me/builds", {
    method: "POST",
    body: JSON.stringify(input),
    getToken,
  });
}

export function updateOwnedBuild(
  buildId: string,
  input: BuildWriteInput,
  getToken: GetToken,
) {
  return apiRequest<Build>(`/me/builds/${encodeURIComponent(buildId)}`, {
    method: "PATCH",
    body: JSON.stringify(input),
    getToken,
  });
}

export function deleteOwnedBuild(buildId: string, getToken: GetToken) {
  return apiRequest<never>(`/me/builds/${encodeURIComponent(buildId)}`, {
    method: "DELETE",
    getToken,
  });
}

export function calculateBuildStats(input: BuildStatsInput, signal?: AbortSignal) {
  return apiRequest<BuildStatsPreview>("/builds/calculate-stats", {
    method: "POST",
    body: JSON.stringify(input),
    signal,
  });
}
