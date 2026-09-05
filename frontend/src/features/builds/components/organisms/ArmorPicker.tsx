import { useState } from "react";
import { useArmorQuery } from "../../../armor/hooks/useArmorQuery";
import type { Armor, ArmorSlot } from "../../../armor/types/armor.types";
import { useDebouncedValue } from "../../../../shared/hooks/useDebouncedValue";
import { ArmorPickerItem } from "../molecules/ArmorPickerItem";
import { ArmorStatsGrid } from "../../../armor/components/molecules/ArmorStatsGrid";
import { ItemDetailsPreview } from "../../../../shared/ui/organisms/ItemDetailsPreview";
import { ItemPickerLayout } from "../layouts/ItemPickerLayout";

interface ArmorPickerProps {
  slot: ArmorSlot;
  slotLabel: string;
  onClose: () => void;
  onRemove?: () => void;
  onSelect: (armor: Armor) => void;
}

export function ArmorPicker({ slot, slotLabel, onClose, onRemove, onSelect }: ArmorPickerProps) {
  const [search, setSearch] = useState("");
  const submittedSearch = useDebouncedValue(search, 250);
  const armorQuery = useArmorQuery({ slot, search: submittedSearch.trim() || undefined });
  const [previewedArmor, setPreviewedArmor] = useState<Armor | null>(null);

  return (
    <ItemPickerLayout
      actions={onRemove && (
        <button className="build-secondary-action" onClick={onRemove} type="button">
          Remove armor
        </button>
      )}
      headingId="armor-picker-heading"
      onClose={onClose}
      onSearchChange={setSearch}
      preview={previewedArmor && (
            <ItemDetailsPreview
              description={previewedArmor.description ?? previewedArmor.summary}
              iconUrl={previewedArmor.iconUrl}
              onClose={() => setPreviewedArmor(null)}
              subtitle={`${formatSlot(previewedArmor.slot)} armor`}
              title={previewedArmor.name}
            >
              <ArmorStatsGrid armor={previewedArmor} />
            </ItemDetailsPreview>
      )}
      searchLabel="Search armor"
      searchPlaceholder="Search armor…"
      searchValue={search}
      subtitle={`For ${slotLabel}`}
      title="Select armor"
    >
            {armorQuery.isPending && <p aria-live="polite">Loading armor…</p>}
            {armorQuery.isError && <p className="text-danger" role="alert">Armor is currently unavailable.</p>}
            {armorQuery.data?.data.length === 0 && <p>No armor matches your search.</p>}
            {armorQuery.data && armorQuery.data.data.length > 0 && (
              <ul className="m-0 grid list-none gap-3 p-0">
                {armorQuery.data.data.map((armor) => (
                  <li key={armor.id}>
                    <ArmorPickerItem
                      armor={armor}
                      onPreview={setPreviewedArmor}
                      onSelect={onSelect}
                    />
                  </li>
                ))}
              </ul>
            )}
    </ItemPickerLayout>
  );
}

function formatSlot(slot: ArmorSlot) {
  return slot[0]!.toUpperCase() + slot.slice(1);
}
