import { useState } from "react";
import { useWeaponsQuery } from "../../../weapons/hooks/useWeaponsQuery";
import type { Weapon } from "../../../weapons/types/weapon.types";
import { WeaponPickerItem } from "../molecules/WeaponPickerItem";
import { useDebouncedValue } from "../../../../shared/hooks/useDebouncedValue";
import { ItemPickerLayout } from "../layouts/ItemPickerLayout";
import { ItemDetailsPreview } from "../../../../shared/ui/organisms/ItemDetailsPreview";
import { WeaponDetailsContent } from "../../../weapons/components/molecules/WeaponDetailsContent";

interface WeaponPickerProps {
  slotLabel: string;
  onClose: () => void;
  onSelect: (weapon: Weapon) => void;
}

export function WeaponPicker({ slotLabel, onClose, onSelect }: WeaponPickerProps) {
  const [search, setSearch] = useState("");
  const submittedSearch = useDebouncedValue(search, 250);
  const [previewedWeapon, setPreviewedWeapon] = useState<Weapon | null>(null);
  const weaponsQuery = useWeaponsQuery({
    search: submittedSearch.trim() || undefined,
  });

  return (
    <ItemPickerLayout
      headingId="weapon-picker-heading"
      onClose={onClose}
      onSearchChange={setSearch}
      preview={previewedWeapon && (
        <ItemDetailsPreview
          description={previewedWeapon.description ?? previewedWeapon.summary}
          iconUrl={previewedWeapon.iconUrl}
          onClose={() => setPreviewedWeapon(null)}
          subtitle={formatWeaponType(previewedWeapon.weaponType)}
          title={previewedWeapon.name}
        >
          <WeaponDetailsContent weapon={previewedWeapon} />
        </ItemDetailsPreview>
      )}
      searchLabel="Search armaments"
      searchPlaceholder="Search armaments…"
      searchValue={search}
      subtitle={`For ${slotLabel}`}
      title="Select a weapon"
    >
      {weaponsQuery.isPending && <p aria-live="polite">Loading armaments…</p>}
      {weaponsQuery.isError && (
        <p className="text-danger" role="alert">
          Armaments are currently unavailable.
        </p>
      )}
      {weaponsQuery.data?.data.length === 0 && (
        <p>No armaments match your search.</p>
      )}
      {weaponsQuery.data && weaponsQuery.data.data.length > 0 && (
        <ul className="m-0 grid list-none gap-3 p-0">
          {weaponsQuery.data.data.map((weapon) => (
            <li key={weapon.id}>
              <WeaponPickerItem
                onPreview={setPreviewedWeapon}
                onSelect={onSelect}
                weapon={weapon}
              />
            </li>
          ))}
        </ul>
      )}
    </ItemPickerLayout>
  );
}

function formatWeaponType(weaponType: string | null) {
  if (!weaponType) return "Unknown armament type";
  return weaponType
    .split("-")
    .map((part) => part[0]?.toUpperCase() + part.slice(1))
    .join(" ");
}
