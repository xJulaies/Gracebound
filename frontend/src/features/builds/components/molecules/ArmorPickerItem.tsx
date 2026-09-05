import type { Armor } from "../../../armor/types/armor.types";
import { ItemPickerResult } from "./ItemPickerResult";

export function ArmorPickerItem({
  armor,
  onPreview,
  onSelect,
}: {
  armor: Armor;
  onPreview: (armor: Armor) => void;
  onSelect: (armor: Armor) => void;
}) {
  return (
    <ItemPickerResult
      badge={armor.hasPassiveEffects
        ? <span className="mt-1 block text-xs text-accent">Passive effect</span>
        : undefined}
      iconUrl={armor.iconUrl}
      metadata={<>Weight {armor.weight} · Poise {armor.poise}</>}
      onPreview={() => onPreview(armor)}
      onSelect={() => onSelect(armor)}
      title={armor.name}
    />
  );
}
