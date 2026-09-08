export function BossCatalogSearchInput({ value, onChange }: {
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="grid gap-2 text-sm text-foreground-muted">
      <span>Search bosses</span>
      <input
        className="rounded-panel border border-border bg-background px-4 py-3 text-foreground outline-none transition-colors placeholder:text-foreground-muted focus:border-focus focus:ring-2 focus:ring-focus/30"
        onChange={(event) => onChange(event.target.value)}
        placeholder="Search by boss name"
        type="search"
        value={value}
      />
    </label>
  );
}
