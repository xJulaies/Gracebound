import type { CrystalTear } from "../../../crystal-tears/types/crystalTear.types";
import { ItemPickerResult } from "./ItemPickerResult";

export function CrystalTearPickerItem({
  crystalTear,
  onPreview,
  onSelect,
}: {
  crystalTear: CrystalTear;
  onPreview: (crystalTear: CrystalTear) => void;
  onSelect: (crystalTear: CrystalTear) => void;
}) {
  return (
    <ItemPickerResult
      badge={crystalTear.calculationStatus === "supported"
        ? <span className="mt-1 block text-xs text-accent">Calculation supported</span>
        : undefined}
      iconUrl={crystalTear.iconUrl}
      metadata={crystalTear.effects?.durationSeconds
        ? `${crystalTear.effects.durationSeconds} second duration`
        : "Wondrous Physick effect"}
      onPreview={() => onPreview(crystalTear)}
      onSelect={() => onSelect(crystalTear)}
      title={crystalTear.name}
    />
  );
}
