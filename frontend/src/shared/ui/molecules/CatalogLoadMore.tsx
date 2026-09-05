import { useEffect, useRef } from "react";

export function CatalogLoadMore({
  hasNextPage,
  isFetching,
  label,
  onLoadMore,
}: {
  hasNextPage: boolean;
  isFetching: boolean;
  label: string;
  onLoadMore: () => void;
}) {
  const triggerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const trigger = triggerRef.current;
    if (!trigger || !hasNextPage || isFetching) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry?.isIntersecting) onLoadMore();
    }, { rootMargin: "50%" });
    observer.observe(trigger);
    return () => observer.disconnect();
  }, [hasNextPage, isFetching, onLoadMore]);

  if (!hasNextPage) return null;

  return (
    <div aria-live="polite" className="mt-6 flex justify-center" ref={triggerRef}>
      <button
        className="cursor-pointer rounded-panel border border-border px-5 py-2 text-accent transition-colors hover:border-accent hover:bg-surface-elevated disabled:cursor-wait disabled:opacity-60"
        disabled={isFetching}
        onClick={onLoadMore}
        type="button"
      >
        {isFetching ? `Loading more ${label.toLowerCase()}…` : `Load more ${label.toLowerCase()}`}
      </button>
    </div>
  );
}
