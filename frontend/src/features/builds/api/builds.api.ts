import { apiRequest } from "../../../shared/api/apiClient";
import type { Build } from "../types/build.types";

type GetToken = () => Promise<string | null>;

export function getPublicBuilds() {
  return apiRequest<Build>("/builds");
}

export function getOwnedBuilds(getToken: GetToken) {
  return apiRequest<Build>("/me/builds", { getToken });
}
