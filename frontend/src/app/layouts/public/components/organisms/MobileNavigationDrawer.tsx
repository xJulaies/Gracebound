import { useRef } from "react";
import { AuthControls } from "../../../../../features/auth/components/AuthControls";
import { useModalDialog } from "../../../../../shared/hooks/useModalDialog";
import { DrawerBackdrop } from "../atoms/DrawerBackdrop";
import { BrandLink } from "../molecules/BrandLink";
import { MainNavigation } from "../molecules/MainNavigation";

export function MobileNavigationDrawer({
  onClose,
}: {
  onClose: () => void;
}) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  useModalDialog({ dialogRef, initialFocusRef: closeButtonRef, onClose });

  return (
    <>
      <DrawerBackdrop onClick={onClose} />
      <div
        aria-label="Navigation menu"
        aria-modal="true"
        className="mobile-drawer fixed inset-y-0 right-0 z-50 flex w-[min(22rem,88vw)] flex-col border-l border-border bg-surface-elevated shadow-2xl shadow-background lg:hidden"
        id="mobile-navigation"
        ref={dialogRef}
        role="dialog"
        tabIndex={-1}
      >
        <div className="flex items-center justify-between gap-4 border-b border-border p-4">
          <BrandLink />
          <button
            aria-label="Close navigation"
            className="size-10 border-border bg-surface p-0 text-xl"
            onClick={onClose}
            ref={closeButtonRef}
            type="button"
          >
            <span aria-hidden="true">×</span>
          </button>
        </div>
        <div className="flex flex-1 flex-col justify-between gap-8 overflow-y-auto p-4">
          <MainNavigation mobile onNavigate={onClose} />
          <div className="border-t border-border pt-4">
            <AuthControls />
          </div>
        </div>
      </div>
    </>
  );
}
