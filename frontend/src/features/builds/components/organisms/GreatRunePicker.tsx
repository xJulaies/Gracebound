import { useMemo, useState } from "react";
import { useGreatRunesQuery } from "../../../great-runes/hooks/useGreatRunesQuery";
import type { GreatRune } from "../../../great-runes/types/greatRune.types";
import { ItemDetailsPreview } from "../../../../shared/ui/organisms/ItemDetailsPreview";
import { ItemPickerLayout } from "../layouts/ItemPickerLayout";
import { GreatRunePickerItem } from "../molecules/GreatRunePickerItem";

export function GreatRunePicker({
  onClose,
  onRemove,
  onSelect,
}: {
  onClose: () => void;
  onRemove?: () => void;
  onSelect: (greatRune: GreatRune) => void;
}) {
  const [search, setSearch] = useState("");
  const [previewed, setPreviewed] = useState<GreatRune | null>(null);
  const query = useGreatRunesQuery();
  const greatRunes = useMemo(() => filterByName(query.data?.data ?? [], search), [query.data, search]);

  return (
    <ItemPickerLayout
      actions={onRemove && <button className="build-secondary-action" onClick={onRemove} type="button">Remove Great Rune</button>}
      headingId="great-rune-picker-heading"
      onClose={onClose}
      onSearchChange={setSearch}
      preview={previewed && (
        <ItemDetailsPreview
          description={previewed.description}
          iconUrl={previewed.iconUrl}
          onClose={() => setPreviewed(null)}
          subtitle={previewed.summary ?? "Great Rune"}
          title={previewed.name}
        >
          <dl className="m-0 text-sm">
            <div className="flex justify-between gap-4 border-t border-border py-2">
              <dt className="text-foreground-muted">Activation</dt>
              <dd className="m-0">{previewed.activation === "rune-arc" ? "Rune Arc" : "Not required"}</dd>
            </div>
          </dl>
          {previewed.limitations.length > 0 && (
            <p className="mt-3 mb-0 text-xs leading-5 text-foreground-muted">
              {previewed.limitations.join(" ")}
            </p>
          )}
        </ItemDetailsPreview>
      )}
      searchLabel="Search Great Runes"
      searchPlaceholder="Search Great Runes…"
      searchValue={search}
      subtitle="Select one active Great Rune"
      title="Select a Great Rune"
    >
      {query.isPending && <p aria-live="polite">Loading Great Runes…</p>}
      {query.isError && <p className="text-danger" role="alert">Great Runes are currently unavailable.</p>}
      {query.data && greatRunes.length === 0 && <p>No Great Runes match your search.</p>}
      <ul className="m-0 grid list-none gap-3 p-0">
        {greatRunes.map((greatRune) => (
          <li key={greatRune.id}>
            <GreatRunePickerItem greatRune={greatRune} onPreview={setPreviewed} onSelect={onSelect} />
          </li>
        ))}
      </ul>
    </ItemPickerLayout>
  );
}

function filterByName<T extends { name: string }>(items: T[], search: string) {
  const query = search.trim().toLocaleLowerCase();
  return query ? items.filter(({ name }) => name.toLocaleLowerCase().includes(query)) : items;
}
