import { type RefObject, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { calculateFloatingPreviewPosition } from "../../domain/calculateFloatingPreviewPosition";

interface PreviewPosition { left: number; top: number }

export function EquippedItemPreview({
  anchorRef, category, iconUrl, lines, name, id, visible,
}: {
  anchorRef: RefObject<HTMLElement | null>;
  category: string;
  iconUrl: string;
  lines: string[];
  name: string;
  id: string;
  visible: boolean;
}) {
  const previewRef = useRef<HTMLSpanElement>(null);
  const [position, setPosition] = useState<PreviewPosition>({ left: 0, top: 0 });

  useLayoutEffect(() => {
    if (!visible) return;
    const updatePosition = () => {
      const anchor = anchorRef.current;
      const preview = previewRef.current;
      if (anchor && preview) {
        setPosition(calculateFloatingPreviewPosition({
          anchor: anchor.getBoundingClientRect(),
          container: anchor.closest(".build-loadout")?.getBoundingClientRect(),
          preview: preview.getBoundingClientRect(),
          rootFontSize: Number.parseFloat(getComputedStyle(document.documentElement).fontSize) || 16,
          viewportHeight: window.innerHeight,
          viewportWidth: window.innerWidth,
        }));
      }
    };
    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);
    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [anchorRef, visible]);

  if (!visible) return null;
  return createPortal(
    <span
      className="pointer-events-none fixed z-50 grid w-[min(16rem,calc(100vw-2rem))] gap-2 rounded-panel border border-accent/70 bg-surface-elevated p-3 text-left shadow-xl"
      id={id}
      ref={previewRef}
      role="tooltip"
      style={position}
    >
      <span className="flex items-center gap-3">
        <img alt="" aria-hidden="true" className="size-12 shrink-0 object-contain" src={iconUrl} />
        <span className="min-w-0">
          <strong className="block text-balance font-heading text-sm text-foreground">{name}</strong>
          <span className="block text-xs text-accent">{category}</span>
        </span>
      </span>
      {lines.length > 0 && (
        <span className="grid gap-1 border-t border-border/60 pt-2 text-xs leading-5 text-foreground-muted">
          {lines.map((line) => <span key={line}>{line}</span>)}
        </span>
      )}
    </span>,
    document.body,
  );
}
