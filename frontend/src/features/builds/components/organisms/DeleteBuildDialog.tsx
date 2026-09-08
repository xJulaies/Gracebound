import { useRef } from "react";
import { createPortal } from "react-dom";
import { useModalDialog } from "../../../../shared/hooks/useModalDialog";

export function DeleteBuildDialog({
  buildName,
  isDeleting,
  onCancel,
  onConfirm,
}: {
  buildName: string;
  isDeleting: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const cancelButtonRef = useRef<HTMLButtonElement>(null);
  useModalDialog({ dialogRef, initialFocusRef: cancelButtonRef, onClose: onCancel });

  return createPortal(
    <div className="fixed inset-0 z-50 overflow-y-auto bg-background/80" role="presentation">
      <div
        aria-labelledby="delete-build-heading"
        aria-modal="true"
        className="relative z-10 flex min-h-full items-start justify-center p-4 py-8 sm:items-center"
        ref={dialogRef}
        role="dialog"
        tabIndex={-1}
      >
        <section className="build-unsaved-dialog">
          <h2 className="mb-3 text-2xl" id="delete-build-heading">Erase this record?</h2>
          <p className="mb-2 leading-7 text-foreground-muted">
            <strong className="font-heading font-normal text-foreground">{buildName}</strong> will be permanently deleted.
          </p>
          <p className="mb-6 text-sm text-danger">This action cannot be undone.</p>
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button
              className="build-secondary-action"
              disabled={isDeleting}
              onClick={onCancel}
              ref={cancelButtonRef}
              type="button"
            >
              Keep record
            </button>
            <button
              className="build-danger-action"
              disabled={isDeleting}
              onClick={onConfirm}
              type="button"
            >
              {isDeleting ? "Deleting…" : "Delete permanently"}
            </button>
          </div>
        </section>
      </div>
    </div>,
    document.body,
  );
}
