import { useAuth } from "@clerk/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { createOwnedBuild, updateOwnedBuild } from "../api/builds.api";
import { toBuildWriteInput } from "../domain/buildDraft";
import type { BuildEditorDraft } from "../types/editor.types";

export type BuildSaveMode = "save" | "save-as-new";

export function useBuildPersistence(initialBuildId: string | null = null) {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();
  const [savedBuildId, setSavedBuildId] = useState<string | null>(initialBuildId);

  const mutation = useMutation({
    mutationFn: async ({ draft, mode }: {
      draft: BuildEditorDraft;
      mode: BuildSaveMode;
    }) => {
      const input = toBuildWriteInput(draft);
      if (savedBuildId && mode === "save") {
        return updateOwnedBuild(savedBuildId, input, getToken);
      }
      return createOwnedBuild(input, getToken);
    },
    onSuccess: async (response) => {
      const savedBuild = response.data[0];
      if (savedBuild) setSavedBuildId(savedBuild.id);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["builds", "owned"] }),
        queryClient.invalidateQueries({ queryKey: ["builds", "public"] }),
      ]);
    },
  });

  return {
    ...mutation,
    savedBuildId,
  };
}
