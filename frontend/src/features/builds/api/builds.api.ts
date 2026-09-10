import { apiRequest } from "../../../shared/api/apiClient";
import type {
  Build,
  BuildStatsInput,
  BuildStatsPreview,
  BuildWriteInput,
} from "../types/build.types";

type GetToken = () => Promise<string | null>;

export interface BuildListQuery {
  page?: number;
  limit?: number;
  visibility?: Build["visibility"];
}

export function getPublicBuilds(query: Omit<BuildListQuery, "visibility"> = {}) {
  return apiRequest<Build>(createBuildListPath("/builds", query));
}

export function getPublicBuild(buildId: string) {
  return apiRequest<Build>(`/builds/${encodeURIComponent(buildId)}`);
}

export function getOwnedBuilds(getToken: GetToken, query: BuildListQuery = {}) {
  return apiRequest<Build>(createBuildListPath("/me/builds", query), { getToken });
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

function createBuildListPath(basePath: string, query: BuildListQuery) {
  const parameters = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined) parameters.set(key, String(value));
  }
  return parameters.size > 0 ? `${basePath}?${parameters.toString()}` : basePath;
}
