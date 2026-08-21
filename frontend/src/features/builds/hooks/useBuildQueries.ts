import { useAuth } from "@clerk/react";
import { useQuery } from "@tanstack/react-query";
import { getOwnedBuilds, getPublicBuilds } from "../api/builds.api";

export function usePublicBuildsQuery() {
  return useQuery({
    queryKey: ["builds", "public"],
    queryFn: getPublicBuilds,
  });
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
