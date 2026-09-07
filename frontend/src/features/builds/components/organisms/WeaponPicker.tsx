import { useMemo, useState } from "react";
import { useInfiniteWeaponsQuery } from "../../../weapons/hooks/useWeaponsQuery";
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
  const weaponsQuery = useInfiniteWeaponsQuery({
    search: submittedSearch.trim() || undefined,
    limit: 100,
  });
  const weaponGroups = useMemo(
    () => groupWeapons(weaponsQuery.data?.pages.flatMap(({ data }) => data) ?? []),
    [weaponsQuery.data],
  );

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
      {weaponsQuery.data && weaponGroups.length === 0 && (
        <p>No armaments match your search.</p>
      )}
      {weaponGroups.map(({ label, weapons }) => (
        <section className="mb-6 last:mb-0" key={label}>
          <h3 className="sticky top-0 z-10 mb-3 rounded-panel border border-border bg-surface-elevated px-4 py-2.5 text-lg text-accent shadow-sm">
            {label}
          </h3>
          <ul className="m-0 grid list-none gap-3 p-0">
            {weapons.map((weapon) => (
              <li key={weapon.id}>
                <WeaponPickerItem onPreview={setPreviewedWeapon} onSelect={onSelect} weapon={weapon} />
              </li>
            ))}
          </ul>
        </section>
      ))}
      {weaponsQuery.hasNextPage && (
        <button
          className="build-secondary-action mt-4 w-full"
          disabled={weaponsQuery.isFetchingNextPage}
          onClick={() => void weaponsQuery.fetchNextPage()}
          type="button"
        >
          {weaponsQuery.isFetchingNextPage ? "Loading…" : "Load more armaments"}
        </button>
      )}
    </ItemPickerLayout>
  );
}

const WEAPON_TYPE_ORDER = [
  "dagger", "straight-sword", "greatsword", "colossal-sword", "light-greatsword",
  "thrusting-sword", "heavy-thrusting-sword", "curved-sword", "curved-greatsword",
  "katana", "great-katana", "twinblade", "axe", "greataxe", "hammer", "flail",
  "great-hammer", "colossal-weapon", "spear", "great-spear", "halberd", "reaper",
  "whip", "fist", "hand-to-hand", "claw", "beast-claw", "backhand-blade",
  "light-bow", "bow", "greatbow", "crossbow", "ballista", "glintstone-staff",
  "sacred-seal", "torch",
] as const;

function groupWeapons(weapons: Weapon[]) {
  const order = new Map<string, number>(WEAPON_TYPE_ORDER.map((type, index) => [type, index]));
  const groups = new Map<string, Weapon[]>();
  for (const weapon of weapons) {
    const type = normalizeWeaponType(weapon.weaponType);
    groups.set(type, [...(groups.get(type) ?? []), weapon]);
  }
  return [...groups.entries()]
    .sort(([left], [right]) => (order.get(left) ?? Number.MAX_SAFE_INTEGER)
      - (order.get(right) ?? Number.MAX_SAFE_INTEGER)
      || left.localeCompare(right))
    .map(([type, entries]) => ({
      label: formatWeaponType(type),
      weapons: entries.sort((left, right) => left.name.localeCompare(right.name)),
    }));
}

function normalizeWeaponType(weaponType: string | null) {
  return (weaponType ?? "unknown-armaments").trim().toLocaleLowerCase().replaceAll(" ", "-");
}

function formatWeaponType(weaponType: string | null) {
  if (!weaponType) return "Unknown armament type";
  return weaponType
    .split("-")
    .map((part) => part[0]?.toUpperCase() + part.slice(1))
    .join(" ");
}
