interface AffinityChipProps {
  active: boolean;
  children: string;
  onClick: () => void;
}

export function AffinityChip({ active, children, onClick }: AffinityChipProps) {
  return (
    <button
      aria-pressed={active}
      className={`rounded-full border px-4 py-2 text-sm transition-colors ${
        active
          ? "border-accent bg-accent text-background"
          : "border-border bg-surface text-foreground-muted hover:border-accent hover:text-foreground"
      }`}
      onClick={onClick}
      type="button"
    >
      {children}
    </button>
  );
}
