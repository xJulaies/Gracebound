import { useAuth } from "@clerk/react";
import { useQuery } from "@tanstack/react-query";
import { getOwnedBuild, getOwnedBuilds, getPublicBuild, getPublicBuilds } from "../api/builds.api";
import { hydrateBuildEditor } from "../domain/hydrateBuildEditor";

export function usePublicBuildsQuery() {
  return useQuery({
    queryKey: ["builds", "public"],
    queryFn: getPublicBuilds,
  });
}

export function usePublicBuildEditorQuery(buildId: string) {
  const buildQuery = useQuery({
    queryKey: ["builds", "public", buildId],
    queryFn: () => getPublicBuild(buildId),
    enabled: buildId.length > 0,
  });
  const build = buildQuery.data?.data[0];
  const editorQuery = useQuery({
    queryKey: ["builds", "public", "hydrated", build?.id, build?.updatedAt],
    queryFn: () => hydrateBuildEditor(build!),
    enabled: Boolean(build),
  });

  return { buildQuery, editorQuery };
}

export function useOwnedBuildsQuery() {
  const { getToken, isLoaded, isSignedIn, userId } = useAuth();

  return {
    isAuthLoaded: isLoaded,
    isSignedIn: Boolean(isSignedIn),
    query: useQuery({
      queryKey: ["builds", "owned", userId],
      queryFn: () => getOwnedBuilds(getToken),
      enabled: isLoaded && Boolean(isSignedIn),
    }),
  };
}

export function useOwnedBuildEditorQuery(buildId: string) {
  const { getToken, isLoaded, isSignedIn, userId } = useAuth();
  const buildQuery = useQuery({
    queryKey: ["builds", "owned", userId, buildId],
    queryFn: () => getOwnedBuild(buildId, getToken),
    enabled: isLoaded && Boolean(isSignedIn) && buildId.length > 0,
  });
  const build = buildQuery.data?.data[0];
  const editorQuery = useQuery({
    queryKey: ["builds", "editor", build?.id, build?.updatedAt],
    queryFn: () => hydrateBuildEditor(build!),
    enabled: Boolean(build),
  });

  return {
    isAuthLoaded: isLoaded,
    isSignedIn: Boolean(isSignedIn),
    buildQuery,
    editorQuery,
  };
}
