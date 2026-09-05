import { useMemo, useState } from "react";
import { useTalismansQuery } from "../../../talismans/hooks/useTalismansQuery";
import type { Talisman } from "../../../talismans/types/talisman.types";
import { ItemPickerLayout } from "../layouts/ItemPickerLayout";
import { TalismanDetailsContent } from "../../../talismans/components/molecules/TalismanDetailsContent";
import { TalismanPickerItem } from "../molecules/TalismanPickerItem";
import { ItemDetailsPreview } from "../../../../shared/ui/organisms/ItemDetailsPreview";

interface TalismanPickerProps {
  slotLabel: string;
  onClose: () => void;
  onRemove?: () => void;
  onSelect: (talisman: Talisman) => void;
}

export function TalismanPicker({
  slotLabel,
  onClose,
  onRemove,
  onSelect,
}: TalismanPickerProps) {
  const [search, setSearch] = useState("");
  const [previewedTalisman, setPreviewedTalisman] = useState<Talisman | null>(null);
  const talismansQuery = useTalismansQuery();
  const talismans = useMemo(() => {
    const normalizedSearch = search.trim().toLocaleLowerCase();
    const entries = talismansQuery.data?.data ?? [];
    return normalizedSearch
      ? entries.filter(({ name }) => name.toLocaleLowerCase().includes(normalizedSearch))
      : entries;
  }, [search, talismansQuery.data]);

  return (
    <ItemPickerLayout
      actions={onRemove && (
        <button className="build-secondary-action" onClick={onRemove} type="button">
          Remove talisman
        </button>
      )}
      headingId="talisman-picker-heading"
      onClose={onClose}
      onSearchChange={setSearch}
      preview={previewedTalisman && (
        <ItemDetailsPreview
          description={previewedTalisman.description}
          iconUrl={previewedTalisman.iconUrl}
          onClose={() => setPreviewedTalisman(null)}
          subtitle="Talisman"
          title={previewedTalisman.name}
        >
          <TalismanDetailsContent talisman={previewedTalisman} />
        </ItemDetailsPreview>
      )}
      searchLabel="Search talismans"
      searchPlaceholder="Search talismans…"
      searchValue={search}
      subtitle={`For ${slotLabel}`}
      title="Select a talisman"
    >
      {talismansQuery.isPending && <p aria-live="polite">Loading talismans…</p>}
      {talismansQuery.isError && (
        <p className="text-danger" role="alert">Talismans are currently unavailable.</p>
      )}
      {talismansQuery.data && talismans.length === 0 && (
        <p>No talismans match your search.</p>
      )}
      {talismans.length > 0 && (
        <ul className="m-0 grid list-none gap-3 p-0">
          {talismans.map((talisman) => (
            <li key={talisman.id}>
              <TalismanPickerItem
                onPreview={setPreviewedTalisman}
                onSelect={onSelect}
                talisman={talisman}
              />
            </li>
          ))}
        </ul>
      )}
    </ItemPickerLayout>
  );
}
