export function MemoryStoneControl({
  count,
  minimumCount = 0,
  onChange,
}: {
  count: number;
  minimumCount?: number;
  onChange: (count: number) => void;
}) {
  return (
    <div className="mb-3 flex items-center justify-between gap-3 rounded-panel border border-border bg-background/45 p-2">
      <span className="text-xs text-foreground-muted">Memory Stones</span>
      <div className="flex items-center gap-2">
        <button
          aria-label="Remove Memory Stone"
          className="build-secondary-action min-w-8 px-2"
          disabled={count <= minimumCount}
          onClick={() => onChange(count - 1)}
          type="button"
        >
          −
        </button>
        <output aria-label="Memory Stone count" className="min-w-5 text-center font-heading text-accent">
          {count}
        </output>
        <button
          aria-label="Add Memory Stone"
          className="build-secondary-action min-w-8 px-2"
          disabled={count === 8}
          onClick={() => onChange(count + 1)}
          type="button"
        >
          +
        </button>
      </div>
    </div>
  );
}
