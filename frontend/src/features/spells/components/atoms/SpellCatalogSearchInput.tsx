export function SpellCatalogSearchInput({
  onChange,
  value,
}: {
  onChange: (value: string) => void;
  value: string;
}) {
  return (
    <label className="block">
      <span className="sr-only">Search spells</span>
      <input
        className="w-full rounded-panel border border-border bg-background px-4 py-3 text-foreground outline-none transition-colors placeholder:text-foreground-muted focus:border-accent focus:ring-2 focus:ring-focus"
        onChange={(event) => onChange(event.currentTarget.value)}
        placeholder="Search sorceries and incantations…"
        type="search"
        value={value}
      />
    </label>
  );
}
