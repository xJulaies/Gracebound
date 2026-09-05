import type { ReactNode } from "react";

interface ItemPickerResultProps {
  badge?: ReactNode;
  iconUrl: string;
  metadata: ReactNode;
  title: string;
  onPreview: () => void;
  onSelect: () => void;
}

export function ItemPickerResult({
  badge,
  iconUrl,
  metadata,
  title,
  onPreview,
  onSelect,
}: ItemPickerResultProps) {
  return (
    <article
      className="flex items-center gap-2 rounded-panel border border-border bg-background/55 p-2 transition-colors hover:border-accent hover:bg-surface focus-within:border-accent"
      onPointerEnter={(event) => {
        if (event.pointerType === "mouse") onPreview();
      }}
    >
      <button
        className="flex min-w-0 flex-1 items-center gap-4 border-0 bg-transparent p-1 text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
        onClick={onSelect}
        onFocus={() => {
          if (canShowInlinePreview()) onPreview();
        }}
        type="button"
      >
        <img alt="" aria-hidden="true" className="size-16 shrink-0 object-contain" src={iconUrl} />
        <span className="min-w-0">
          <strong className="block text-balance break-words font-heading text-foreground">
            {title}
          </strong>
          <span className="block text-sm text-foreground-muted">{metadata}</span>
          {badge}
        </span>
      </button>
      <button
        className="build-secondary-action px-3 lg:hidden"
        onClick={onPreview}
        type="button"
      >
        Details
      </button>
    </article>
  );
}

function canShowInlinePreview() {
  return typeof window.matchMedia === "function"
    && window.matchMedia("(min-width: 64rem)").matches;
}
