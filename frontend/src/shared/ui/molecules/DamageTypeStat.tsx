import type { DamageType } from "../../domain/damageTypes";

const typeClasses: Record<DamageType, string> = {
  physical: "border-l-damage-physical text-damage-physical",
  magic: "border-l-damage-magic text-damage-magic",
  fire: "border-l-damage-fire text-damage-fire",
  lightning: "border-l-damage-lightning text-damage-lightning",
  holy: "border-l-damage-holy text-damage-holy",
};

const markerClasses: Record<DamageType, string> = {
  physical: "bg-damage-physical",
  magic: "bg-damage-magic",
  fire: "bg-damage-fire",
  lightning: "bg-damage-lightning",
  holy: "bg-damage-holy",
};

export function DamageTypeStat({ compact = false, label, type, value }: {
  compact?: boolean;
  label: string;
  type: DamageType;
  value: number | string;
}) {
  return (
    <div className={`${typeClasses[type]} rounded-panel border border-border border-l-2 bg-background/40 ${compact ? "mb-2 p-2 last:mb-0" : "p-3"}`}>
      <dt className="flex items-center gap-2 text-sm">
        <span aria-hidden="true" className={`${markerClasses[type]} size-2 shrink-0 rounded-full`} />
        {label}
      </dt>
      <dd className={`mt-1 text-foreground ${compact ? "text-base" : "text-lg"}`}>{value}</dd>
    </div>
  );
}
