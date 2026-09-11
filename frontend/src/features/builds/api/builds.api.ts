import { apiRequest } from "../../../shared/api/apiClient";
import { z } from "zod";
import {
  buildIdSchema,
  buildListQuerySchema,
  buildSchema,
  buildStatsInputSchema,
  buildStatsPreviewSchema,
  parseBuildWriteInput,
} from "../schemas/build.schemas";
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
  return apiRequest<Build>(createBuildListPath("/builds", query), {
    responseSchema: buildSchema,
  });
}

export function getPublicBuild(buildId: string) {
  const validatedId = buildIdSchema.parse(buildId);
  return apiRequest<Build>(`/builds/${encodeURIComponent(validatedId)}`, {
    responseSchema: buildSchema,
  });
}

export function getOwnedBuilds(getToken: GetToken, query: BuildListQuery = {}) {
  return apiRequest<Build>(createBuildListPath("/me/builds", query), {
    getToken,
    responseSchema: buildSchema,
  });
}

export function getOwnedBuild(buildId: string, getToken: GetToken) {
  const validatedId = buildIdSchema.parse(buildId);
  return apiRequest<Build>(`/me/builds/${encodeURIComponent(validatedId)}`, {
    getToken,
    responseSchema: buildSchema,
  });
}

export function createOwnedBuild(input: BuildWriteInput, getToken: GetToken) {
  const validatedInput = parseBuildWriteInput(input);
  return apiRequest<Build>("/me/builds", {
    method: "POST",
    body: JSON.stringify(validatedInput),
    getToken,
    responseSchema: buildSchema,
  });
}

export function updateOwnedBuild(
  buildId: string,
  input: BuildWriteInput,
  getToken: GetToken,
) {
  const validatedId = buildIdSchema.parse(buildId);
  const validatedInput = parseBuildWriteInput(input);
  return apiRequest<Build>(`/me/builds/${encodeURIComponent(validatedId)}`, {
    method: "PATCH",
    body: JSON.stringify(validatedInput),
    getToken,
    responseSchema: buildSchema,
  });
}

export function deleteOwnedBuild(buildId: string, getToken: GetToken) {
  const validatedId = buildIdSchema.parse(buildId);
  return apiRequest<never>(`/me/builds/${encodeURIComponent(validatedId)}`, {
    method: "DELETE",
    getToken,
    responseSchema: z.never(),
  });
}

export function calculateBuildStats(input: BuildStatsInput, signal?: AbortSignal) {
  const validatedInput = buildStatsInputSchema.parse(input);
  return apiRequest<BuildStatsPreview>("/builds/calculate-stats", {
    method: "POST",
    body: JSON.stringify(validatedInput),
    signal,
    responseSchema: buildStatsPreviewSchema,
  });
}

function createBuildListPath(basePath: string, query: BuildListQuery) {
  const validatedQuery = buildListQuerySchema.parse(query);
  const parameters = new URLSearchParams();
  for (const [key, value] of Object.entries(validatedQuery)) {
    if (value !== undefined) parameters.set(key, String(value));
  }
  return parameters.size > 0 ? `${basePath}?${parameters.toString()}` : basePath;
}
