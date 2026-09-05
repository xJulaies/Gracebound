import { UpgradeButton } from "../atoms/UpgradeButton";

interface UpgradeControlProps {
  max: number;
  value: number;
  onChange: (level: number) => void;
}

export function UpgradeControl({ max, value, onChange }: UpgradeControlProps) {
  const setLevel = (level: number) => onChange(Math.min(max, Math.max(0, level)));

  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-4">
        <h4 className="mb-0 text-base">Upgrade level</h4>
        <span className="text-sm text-foreground-muted">Maximum +{max}</span>
      </div>
      <div className="flex items-center gap-2">
        <UpgradeButton
          disabled={value === 0}
          label="Decrease upgrade level"
          onClick={(event) => setLevel(value - (event.shiftKey ? 5 : 1))}
        >
          −
        </UpgradeButton>
        <label className="min-w-0 flex-1">
          <span className="sr-only">Upgrade level</span>
          <input
            className="weapon-upgrade-input h-11 w-full rounded-panel border border-border bg-surface px-3 text-center text-foreground outline-none focus:border-accent focus:ring-2 focus:ring-focus"
            max={max}
            min={0}
            onChange={(event) => setLevel(Number(event.target.value))}
            type="number"
            value={value}
          />
        </label>
        <UpgradeButton
          disabled={value === max}
          label="Increase upgrade level"
          onClick={(event) => setLevel(value + (event.shiftKey ? 5 : 1))}
        >
          +
        </UpgradeButton>
      </div>
      <p className="mt-2 mb-0 text-xs text-foreground-muted">
        Hold Shift while clicking − or + to change by 5.
      </p>
    </div>
  );
}
