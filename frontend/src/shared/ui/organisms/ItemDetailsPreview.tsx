import type { ReactNode, Ref } from "react";

export interface ItemDetailsPreviewProps {
  children: ReactNode;
  description: string | null;
  iconUrl: string;
  subtitle: string;
  title: string;
  onClose?: () => void;
  closeButtonRef?: Ref<HTMLButtonElement>;
}

export function ItemDetailsPreview({
  children,
  description,
  iconUrl,
  subtitle,
  title,
  onClose,
  closeButtonRef,
}: ItemDetailsPreviewProps) {
  return (
    <aside
      aria-label={`${title} details`}
      className="item-details-preview fixed inset-0 z-30 overflow-y-auto bg-surface-elevated p-5 lg:static lg:z-auto lg:max-h-full lg:w-[26rem] lg:shrink-0 lg:rounded-panel lg:border lg:border-border lg:bg-background/90 lg:p-5 lg:shadow-2xl"
    >
      <header className="mb-5 flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-center gap-4">
          <span className="grid size-24 shrink-0 place-items-center rounded-panel border border-border bg-surface p-2">
            <img alt="" aria-hidden="true" className="size-full object-contain" src={iconUrl} />
          </span>
          <div className="min-w-0">
            <h3 className="mb-1 text-balance break-words text-xl">{title}</h3>
            <p className="mb-0 text-sm text-foreground-muted">{subtitle}</p>
          </div>
        </div>
        {onClose && (
          <button
            className="build-secondary-action"
            onClick={onClose}
            ref={closeButtonRef}
            type="button"
          >
            Close
          </button>
        )}
      </header>

      <p className="mb-5 text-sm leading-6 text-foreground-muted">
        {description || "No description is available for this item."}
      </p>
      {children}
    </aside>
  );
}
