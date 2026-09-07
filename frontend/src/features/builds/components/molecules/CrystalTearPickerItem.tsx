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
      badge={<span className={`mt-1 block text-xs ${crystalTear.calculationStatus === "supported" ? "text-accent" : "text-foreground-muted"}`}>
        {crystalTear.calculationStatus === "supported" ? "Calculation supported" : "Catalog only"}
      </span>}
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
