import type { Weapon } from "../../../weapons/types/weapon.types";
import { ItemPickerResult } from "./ItemPickerResult";

interface WeaponPickerItemProps {
  weapon: Weapon;
  onPreview: (weapon: Weapon) => void;
  onSelect: (weapon: Weapon) => void;
}

export function WeaponPickerItem({ weapon, onPreview, onSelect }: WeaponPickerItemProps) {
  return (
    <ItemPickerResult
      iconUrl={weapon.iconUrl}
      metadata={<>{formatLabel(weapon.weaponType ?? "Unknown type")} · Weight {weapon.weight}</>}
      onPreview={() => onPreview(weapon)}
      onSelect={() => onSelect(weapon)}
      title={weapon.name}
    />
  );
}

function formatLabel(value: string) {
  return value
    .split("-")
    .map((part) => part[0]?.toUpperCase() + part.slice(1))
    .join(" ");
}
