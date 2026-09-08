export type BuildRecordVisibility = "all" | "private" | "public";

const filters: Array<{ label: string; value: BuildRecordVisibility }> = [
  { label: "All records", value: "all" },
  { label: "Private", value: "private" },
  { label: "Public", value: "public" },
];

export function BuildRecordFilter({
  value,
  onChange,
}: {
  value: BuildRecordVisibility;
  onChange: (value: BuildRecordVisibility) => void;
}) {
  return (
    <fieldset className="border-0 p-0">
      <legend className="sr-only">Filter build records by visibility</legend>
      <div className="flex flex-wrap gap-2">
        {filters.map((filter) => (
          <button
            aria-pressed={value === filter.value}
            className="build-secondary-action"
            key={filter.value}
            onClick={() => onChange(filter.value)}
            type="button"
          >
            {filter.label}
          </button>
        ))}
      </div>
    </fieldset>
  );
}
