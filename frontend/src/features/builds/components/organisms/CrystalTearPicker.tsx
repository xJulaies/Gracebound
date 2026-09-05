import { useMemo, useState } from "react";
import { useCrystalTearsQuery } from "../../../crystal-tears/hooks/useCrystalTearsQuery";
import type { CrystalTear } from "../../../crystal-tears/types/crystalTear.types";
import { ItemDetailsPreview } from "../../../../shared/ui/organisms/ItemDetailsPreview";
import { ItemPickerLayout } from "../layouts/ItemPickerLayout";
import { CrystalTearPickerItem } from "../molecules/CrystalTearPickerItem";

export function CrystalTearPicker({
  excludedIds,
  onClose,
  onRemove,
  onSelect,
  slotLabel,
}: {
  excludedIds: string[];
  onClose: () => void;
  onRemove?: () => void;
  onSelect: (crystalTear: CrystalTear) => void;
  slotLabel: string;
}) {
  const [search, setSearch] = useState("");
  const [previewed, setPreviewed] = useState<CrystalTear | null>(null);
  const query = useCrystalTearsQuery();
  const crystalTears = useMemo(() => {
    const normalizedSearch = search.trim().toLocaleLowerCase();
    return (query.data?.data ?? []).filter(({ id, name }) =>
      !excludedIds.includes(id)
      && (!normalizedSearch || name.toLocaleLowerCase().includes(normalizedSearch)),
    );
  }, [excludedIds, query.data, search]);

  return (
    <ItemPickerLayout
      actions={onRemove && <button className="build-secondary-action" onClick={onRemove} type="button">Remove Crystal Tear</button>}
      headingId="crystal-tear-picker-heading"
      onClose={onClose}
      onSearchChange={setSearch}
      preview={previewed && (
        <ItemDetailsPreview
          description={previewed.description}
          iconUrl={previewed.iconUrl}
          onClose={() => setPreviewed(null)}
          subtitle={previewed.summary ?? "Crystal Tear"}
          title={previewed.name}
        >
          <dl className="m-0 text-sm">
            <div className="flex justify-between gap-4 border-t border-border py-2">
              <dt className="text-foreground-muted">Duration</dt>
              <dd className="m-0">
                {previewed.effects?.durationSeconds
                  ? `${previewed.effects.durationSeconds} seconds`
                  : "Instant or passive"}
              </dd>
            </div>
          </dl>
          {previewed.limitations.length > 0 && (
            <p className="mt-3 mb-0 text-xs leading-5 text-foreground-muted">
              {previewed.limitations.join(" ")}
            </p>
          )}
        </ItemDetailsPreview>
      )}
      searchLabel="Search Crystal Tears"
      searchPlaceholder="Search Crystal Tears…"
      searchValue={search}
      subtitle={`For ${slotLabel}`}
      title="Select a Crystal Tear"
    >
      {query.isPending && <p aria-live="polite">Loading Crystal Tears…</p>}
      {query.isError && <p className="text-danger" role="alert">Crystal Tears are currently unavailable.</p>}
      {query.data && crystalTears.length === 0 && <p>No Crystal Tears match your search.</p>}
      <ul className="m-0 grid list-none gap-3 p-0">
        {crystalTears.map((crystalTear) => (
          <li key={crystalTear.id}>
            <CrystalTearPickerItem crystalTear={crystalTear} onPreview={setPreviewed} onSelect={onSelect} />
          </li>
        ))}
      </ul>
    </ItemPickerLayout>
  );
}
