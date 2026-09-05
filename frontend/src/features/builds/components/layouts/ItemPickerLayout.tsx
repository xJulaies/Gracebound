import { useRef, type ReactNode } from "react";
import { useModalDialog } from "../../../../shared/hooks/useModalDialog";
import { PickerSearchInput } from "../atoms/PickerSearchInput";

interface ItemPickerLayoutProps {
  actions?: ReactNode;
  children: ReactNode;
  headingId: string;
  preview?: ReactNode;
  searchLabel: string;
  searchPlaceholder: string;
  searchValue: string;
  subtitle: string;
  title: string;
  onClose: () => void;
  onSearchChange: (value: string) => void;
}

export function ItemPickerLayout({
  actions,
  children,
  headingId,
  preview,
  searchLabel,
  searchPlaceholder,
  searchValue,
  subtitle,
  title,
  onClose,
  onSearchChange,
}: ItemPickerLayoutProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  useModalDialog({ dialogRef, initialFocusRef: searchInputRef, onClose });

  return (
    <div className="fixed inset-0 z-50 bg-background/75" role="presentation">
      <button
        aria-label="Close item picker"
        className="absolute inset-0 cursor-default border-0 bg-transparent"
        onClick={onClose}
        type="button"
      />
      <div
        aria-labelledby={headingId}
        aria-modal="true"
        className="relative z-10 ml-auto flex h-full w-full justify-end lg:items-center lg:gap-4 lg:p-4"
        onClick={(event) => {
          if (event.target === event.currentTarget) onClose();
        }}
        ref={dialogRef}
        role="dialog"
        tabIndex={-1}
      >
        {preview}
        <section className="flex h-full w-full flex-col border-l border-border bg-surface-elevated p-4 shadow-2xl sm:max-w-xl sm:p-6">
          <header className="mb-5 flex items-start justify-between gap-4">
            <div>
              <h2 className="mb-1 text-2xl" id={headingId}>{title}</h2>
              <p className="mb-0 text-sm text-foreground-muted">{subtitle}</p>
            </div>
            <div className="flex flex-wrap justify-end gap-2">
              {actions}
              <button className="build-secondary-action" onClick={onClose} type="button">
                Close
              </button>
            </div>
          </header>

          <PickerSearchInput
            inputRef={searchInputRef}
            label={searchLabel}
            onChange={onSearchChange}
            placeholder={searchPlaceholder}
            value={searchValue}
          />
          <div className="mt-5 min-h-0 flex-1 overflow-y-auto pr-1">
            {children}
          </div>
        </section>
      </div>
    </div>
  );
}
