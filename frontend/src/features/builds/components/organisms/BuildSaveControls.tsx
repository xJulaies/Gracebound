import { useState } from "react";
import { ApiError } from "../../../../shared/api/apiClient";
import { useBuildPersistence } from "../../hooks/useBuildPersistence";
import { getZodErrorMessage } from "../../schemas/build.schemas";
import type { BuildEditorDraft, BuildEditorMetadata } from "../../types/editor.types";
import { BuildSaveDialog } from "./BuildSaveDialog";

export function BuildSaveControls({
  draft,
  isDirty,
  onMetadataChange,
  onSaved,
  initialBuildId = null,
}: {
  draft: BuildEditorDraft;
  isDirty: boolean;
  onMetadataChange: (metadata: BuildEditorMetadata) => void;
  onSaved: (draft: BuildEditorDraft) => void;
  initialBuildId?: string | null;
}) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const persistence = useBuildPersistence(initialBuildId);

  const closeDialog = () => {
    if (persistence.isPending) return;
    persistence.reset();
    setIsDialogOpen(false);
  };

  return (
    <>
      <header className="build-save-bar">
        <div className="min-w-0">
          <p className="mb-1 truncate font-heading text-lg text-foreground">{draft.name}</p>
          <p className="mb-0 text-xs uppercase tracking-widest text-foreground-muted">
            {isDirty ? "Unsaved changes" : "All changes saved"}
          </p>
        </div>
        <button
          className="build-primary-action"
          onClick={() => setIsDialogOpen(true)}
          type="button"
        >
          {persistence.savedBuildId ? "Save changes" : "Save build"}
        </button>
      </header>
      {isDialogOpen && (
        <BuildSaveDialog
          canSaveAsNew={persistence.savedBuildId !== null}
          errorMessage={persistence.error instanceof ApiError
            ? persistence.error.message
            : persistence.isError
              ? getZodErrorMessage(persistence.error, "The build could not be saved. Try again.")
              : null}
          initialMetadata={{
            name: draft.name,
            description: draft.description,
            visibility: draft.visibility,
          }}
          isSaving={persistence.isPending}
          onClose={closeDialog}
          onSave={async (metadata, mode) => {
            const buildToSave = { ...draft, ...metadata };
            await persistence.mutateAsync({ draft: buildToSave, mode });
            onMetadataChange(metadata);
            onSaved(buildToSave);
            setIsDialogOpen(false);
          }}
        />
      )}
    </>
  );
}
