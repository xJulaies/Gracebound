import type { CSSProperties } from "react";

export function BossHealthBar({
  currentHealth,
  hitId,
  maximumHealth,
  name,
}: {
  currentHealth: number;
  hitId?: string;
  maximumHealth: number;
  name: string;
}) {
  const safeMaximum = Math.max(0, maximumHealth);
  const safeCurrent = Math.min(Math.max(0, currentHealth), safeMaximum);
  const percentage = safeMaximum === 0 ? 0 : (safeCurrent / safeMaximum) * 100;
  const healthStyle = {
    "--damage-trial-health": `${percentage}%`,
  } as CSSProperties;

  return (
    <div className="grid gap-2">
      <div className="grid min-w-0 gap-1 sm:flex sm:items-end sm:justify-between sm:gap-4">
        <h3 className="m-0 min-w-0 break-words text-lg sm:text-xl">{name}</h3>
        <span className="shrink-0 text-sm text-foreground-muted">
          {safeCurrent.toLocaleString()} / {safeMaximum.toLocaleString()} HP
        </span>
      </div>
      <div
        aria-label={`${name} health`}
        aria-valuemax={safeMaximum}
        aria-valuemin={0}
        aria-valuenow={safeCurrent}
        className="damage-trial-health-track"
        role="progressbar"
      >
        <span aria-hidden="true" className="damage-trial-health-fill" style={healthStyle} />
        {hitId && <span aria-hidden="true" className="damage-trial-health-slash" key={hitId} />}
      </div>
    </div>
  );
}
