import { useAuth } from "@clerk/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createOwnedBuild, deleteOwnedBuild } from "../api/builds.api";
import { toBuildEditorDraft, toBuildWriteInput } from "../domain/buildDraft";
import type { Build } from "../types/build.types";

export function useDuplicateBuildMutation() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (build: Build) => {
      const draft = toBuildEditorDraft(build);
      return createOwnedBuild(toBuildWriteInput({
        ...draft,
        name: createCopyName(draft.name),
        visibility: "private",
      }), getToken);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["builds", "owned"] }),
  });
}

export function useDeleteBuildMutation() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (buildId: string) => deleteOwnedBuild(buildId, getToken),
    onSuccess: () => Promise.all([
      queryClient.invalidateQueries({ queryKey: ["builds", "owned"] }),
      queryClient.invalidateQueries({ queryKey: ["builds", "public"] }),
    ]),
  });
}

function createCopyName(name: string) {
  const suffix = " Copy";
  return `${name.slice(0, 80 - suffix.length).trimEnd()}${suffix}`;
}
