import type { EquippedWeapon } from "../../types/editor.types";
import { getEquippedWeaponDisplayName } from "../../domain/getEquippedWeaponDisplayName";

interface SelectedWeaponSummaryProps {
  configuration: EquippedWeapon;
  slotLabel: string;
}

export function SelectedWeaponSummary({
  configuration,
  slotLabel,
}: SelectedWeaponSummaryProps) {
  const { weapon } = configuration;

  return (
    <div className="flex min-w-0 items-center gap-4">
      <span className="grid size-20 shrink-0 place-items-center rounded-panel border border-border bg-surface p-2">
        <img alt="" aria-hidden="true" className="size-full object-contain" src={weapon.iconUrl} />
      </span>
      <div className="min-w-0">
        <p className="mb-1 text-sm font-semibold uppercase tracking-wide text-accent">
          Editing · {slotLabel}
        </p>
        <h3 className="mb-1 text-balance break-words text-2xl" id="weapon-inspector-heading">
          {getEquippedWeaponDisplayName(configuration)}
        </h3>
        <p className="mb-0 text-sm text-foreground-muted">
          {weapon.weaponType ?? "Unknown type"} · Weight {weapon.weight}
        </p>
      </div>
    </div>
  );
}
