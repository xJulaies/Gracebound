import { useBlocker } from "@tanstack/react-router";
import { useRef } from "react";
import { createPortal } from "react-dom";
import { useModalDialog } from "../../../../shared/hooks/useModalDialog";

export function UnsavedBuildChangesGuard({ isDirty }: { isDirty: boolean }) {
  const blocker = useBlocker({
    shouldBlockFn: () => isDirty,
    enableBeforeUnload: isDirty,
    withResolver: true,
  });

  if (blocker.status !== "blocked") return null;

  return (
    <UnsavedChangesDialog
      onLeave={blocker.proceed}
      onStay={blocker.reset}
    />
  );
}

function UnsavedChangesDialog({
  onLeave,
  onStay,
}: {
  onLeave: () => void;
  onStay: () => void;
}) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const stayButtonRef = useRef<HTMLButtonElement>(null);
  useModalDialog({ dialogRef, initialFocusRef: stayButtonRef, onClose: onStay });

  return createPortal(
    <div className="fixed inset-0 z-50 overflow-y-auto bg-background/80" role="presentation">
      <div
        aria-labelledby="unsaved-build-heading"
        aria-modal="true"
        className="relative z-10 flex min-h-full items-start justify-center p-4 py-8 sm:items-center"
        ref={dialogRef}
        role="dialog"
        tabIndex={-1}
      >
        <section className="build-unsaved-dialog">
          <h2 className="mb-3 text-2xl" id="unsaved-build-heading">Abandon this build?</h2>
          <p className="mb-6 leading-7 text-foreground-muted">
            Your unsaved changes will be lost if you leave this page.
          </p>
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button className="build-secondary-action" onClick={onLeave} type="button">
              Leave without saving
            </button>
            <button className="build-primary-action" onClick={onStay} ref={stayButtonRef} type="button">
              Keep editing
            </button>
          </div>
        </section>
      </div>
    </div>,
    document.body,
  );
}
