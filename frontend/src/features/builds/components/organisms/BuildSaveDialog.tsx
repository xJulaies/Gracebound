import { useRef, useState, type FormEvent } from "react";
import { createPortal } from "react-dom";
import { useModalDialog } from "../../../../shared/hooks/useModalDialog";
import type { BuildEditorMetadata } from "../../types/editor.types";
import type { BuildSaveMode } from "../../hooks/useBuildPersistence";

export function BuildSaveDialog({
  canSaveAsNew,
  initialMetadata,
  isSaving,
  errorMessage,
  onClose,
  onSave,
}: {
  canSaveAsNew: boolean;
  initialMetadata: BuildEditorMetadata;
  isSaving: boolean;
  errorMessage: string | null;
  onClose: () => void;
  onSave: (metadata: BuildEditorMetadata, mode: BuildSaveMode) => Promise<void>;
}) {
  const [metadata, setMetadata] = useState(initialMetadata);
  const [validationError, setValidationError] = useState<string | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);
  useModalDialog({ dialogRef, initialFocusRef: nameInputRef, onClose });

  const submit = async (mode: BuildSaveMode) => {
    const normalized = {
      ...metadata,
      name: metadata.name.trim(),
      description: metadata.description.trim(),
    };
    if (!normalized.name) {
      setValidationError("Give this build a name before saving.");
      nameInputRef.current?.focus();
      return;
    }
    if (normalized.name.length > 80 || normalized.description.length > 1000) {
      setValidationError("The build name or description is too long.");
      return;
    }
    setValidationError(null);
    try {
      await onSave(normalized, mode);
    } catch {
      // The mutation owns the user-facing error state.
    }
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    void submit("save");
  };

  return createPortal(
    <div className="fixed inset-0 z-50 overflow-y-auto bg-background/80" role="presentation">
      <button
        aria-label="Close save build dialog"
        className="absolute inset-0 cursor-default rounded-none border-0 bg-transparent"
        disabled={isSaving}
        onClick={onClose}
        type="button"
      />
      <div
        aria-labelledby="save-build-heading"
        aria-modal="true"
        className="relative z-10 flex min-h-full items-start justify-center p-4 py-8 sm:items-center"
        ref={dialogRef}
        role="dialog"
        tabIndex={-1}
      >
        <form className="build-save-dialog" noValidate onSubmit={handleSubmit}>
          <div className="build-save-dialog__ornament" aria-hidden="true" />
          <header>
            <h2 className="mb-2 text-2xl sm:text-3xl" id="save-build-heading">
              Record your build
            </h2>
            <p className="mb-0 text-sm leading-6 text-foreground-muted">
              Name the build and choose whether other Tarnished may view it.
            </p>
          </header>

          <label className="grid gap-2 font-heading text-sm text-accent" htmlFor="build-name">
            Build name
            <input
              className="build-save-input"
              id="build-name"
              maxLength={80}
              onChange={(event) => setMetadata((current) => ({
                ...current,
                name: event.target.value,
              }))}
              ref={nameInputRef}
              required
              value={metadata.name}
            />
          </label>

          <label className="grid gap-2 font-heading text-sm text-accent" htmlFor="build-description">
            Description
            <textarea
              className="build-save-input min-h-28 resize-y font-sans"
              id="build-description"
              maxLength={1000}
              onChange={(event) => setMetadata((current) => ({
                ...current,
                description: event.target.value,
              }))}
              value={metadata.description}
            />
          </label>

          <fieldset className="grid gap-3 border-0 p-0">
            <legend className="mb-2 font-heading text-sm text-accent">Visibility</legend>
            <label className="build-visibility-choice">
              <input
                checked={metadata.visibility === "private"}
                name="build-visibility"
                onChange={() => setMetadata((current) => ({ ...current, visibility: "private" }))}
                type="radio"
              />
              <span><strong>Private</strong><small>Only you can open this build.</small></span>
            </label>
            <label className="build-visibility-choice">
              <input
                checked={metadata.visibility === "public"}
                name="build-visibility"
                onChange={() => setMetadata((current) => ({ ...current, visibility: "public" }))}
                type="radio"
              />
              <span><strong>Public</strong><small>Visible in the community build gallery.</small></span>
            </label>
          </fieldset>

          {(validationError || errorMessage) && (
            <p className="mb-0 text-sm text-danger" role="alert">
              {validationError ?? errorMessage}
            </p>
          )}

          <footer className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button className="build-secondary-action" disabled={isSaving} onClick={onClose} type="button">
              Cancel
            </button>
            {canSaveAsNew && (
              <button
                className="build-secondary-action"
                disabled={isSaving}
                onClick={() => void submit("save-as-new")}
                type="button"
              >
                Save as new
              </button>
            )}
            <button className="build-primary-action" disabled={isSaving} type="submit">
              {isSaving ? "Saving…" : canSaveAsNew ? "Save changes" : "Save build"}
            </button>
          </footer>
        </form>
      </div>
    </div>,
    document.body,
  );
}
