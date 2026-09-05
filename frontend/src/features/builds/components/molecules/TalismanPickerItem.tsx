import type { Talisman } from "../../../talismans/types/talisman.types";
import { ItemPickerResult } from "./ItemPickerResult";

export function TalismanPickerItem({
  onPreview,
  onSelect,
  talisman,
}: {
  onPreview: (talisman: Talisman) => void;
  onSelect: (talisman: Talisman) => void;
  talisman: Talisman;
}) {
  return (
    <ItemPickerResult
      badge={talisman.calculationStatus === "supported"
        ? <span className="mt-1 block text-xs text-accent">Calculation supported</span>
        : undefined}
      iconUrl={talisman.iconUrl}
      metadata={<>Weight {talisman.weight}</>}
      onPreview={() => onPreview(talisman)}
      onSelect={() => onSelect(talisman)}
      title={talisman.name}
    />
  );
}
