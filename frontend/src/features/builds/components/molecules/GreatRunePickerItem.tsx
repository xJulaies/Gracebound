import type { GreatRune } from "../../../great-runes/types/greatRune.types";
import { ItemPickerResult } from "./ItemPickerResult";

export function GreatRunePickerItem({
  greatRune,
  onPreview,
  onSelect,
}: {
  greatRune: GreatRune;
  onPreview: (greatRune: GreatRune) => void;
  onSelect: (greatRune: GreatRune) => void;
}) {
  return (
    <ItemPickerResult
      badge={greatRune.calculationStatus === "supported"
        ? <span className="mt-1 block text-xs text-accent">Calculation supported</span>
        : undefined}
      iconUrl={greatRune.iconUrl}
      metadata={greatRune.activation === "rune-arc" ? "Activated with Rune Arc" : "Passive"}
      onPreview={() => onPreview(greatRune)}
      onSelect={() => onSelect(greatRune)}
      title={greatRune.name}
    />
  );
}
