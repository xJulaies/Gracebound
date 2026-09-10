import { useAuth } from "@clerk/react";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { getOwnedBuild, getOwnedBuilds, getPublicBuild, getPublicBuilds } from "../api/builds.api";
import type { Build } from "../types/build.types";
import { hydrateBuildEditor } from "../domain/hydrateBuildEditor";

export function usePublicBuildsQuery() {
  return useInfiniteQuery({
    queryKey: ["builds", "public", "infinite"],
    queryFn: ({ pageParam }) => getPublicBuilds({ page: pageParam }),
    initialPageParam: 1,
    getNextPageParam: getNextBuildPage,
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

export function useOwnedBuildsQuery(visibility?: Build["visibility"]) {
  const { getToken, isLoaded, isSignedIn, userId } = useAuth();

  return {
    isAuthLoaded: isLoaded,
    isSignedIn: Boolean(isSignedIn),
    query: useInfiniteQuery({
      queryKey: ["builds", "owned", userId, "infinite", visibility],
      queryFn: ({ pageParam }) => getOwnedBuilds(getToken, {
        page: pageParam,
        visibility,
      }),
      initialPageParam: 1,
      getNextPageParam: getNextBuildPage,
      enabled: isLoaded && Boolean(isSignedIn),
    }),
  };
}

function getNextBuildPage(
  lastPage: Awaited<ReturnType<typeof getPublicBuilds>>,
  pages: Array<Awaited<ReturnType<typeof getPublicBuilds>>>,
) {
  const loadedCount = pages.reduce((total, page) => total + page.data.length, 0);
  return loadedCount < (lastPage.totalCount ?? loadedCount)
    ? pages.length + 1
    : undefined;
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
