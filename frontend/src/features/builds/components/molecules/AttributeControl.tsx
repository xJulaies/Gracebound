import type { CharacterStats } from "../../../../shared/types/game.types";

interface AttributeControlProps {
  attribute: keyof CharacterStats;
  minimum: number;
  onChange: (attribute: keyof CharacterStats, value: number) => void;
  value: number;
}

export function AttributeControl({
  attribute,
  minimum,
  onChange,
  value,
}: AttributeControlProps) {
  const label = attribute.charAt(0).toUpperCase() + attribute.slice(1);

  const adjust = (amount: number, useLargeStep: boolean) => {
    const step = useLargeStep ? 5 : 1;
    onChange(attribute, Math.min(99, Math.max(minimum, value + amount * step)));
  };

  return (
    <div className="grid grid-cols-[minmax(0,1fr)_2.75rem_2.75rem_3.25rem] items-center gap-2 border-b border-border/70 py-2 last:border-b-0">
      <label className="build-attribute-label min-w-0" htmlFor={`attribute-${attribute}`}>
        {label}
      </label>
      <button
        aria-label={`Decrease ${label}`}
        className="build-stat-button"
        disabled={value <= minimum}
        onClick={(event) => adjust(-1, event.shiftKey)}
        type="button"
      >
        −
      </button>
      <button
        aria-label={`Increase ${label}`}
        className="build-stat-button"
        disabled={value >= 99}
        onClick={(event) => adjust(1, event.shiftKey)}
        type="button"
      >
        +
      </button>
      <input
        aria-describedby={`attribute-${attribute}-minimum`}
        className="weapon-upgrade-input min-h-11 w-full rounded-panel border border-border bg-background px-2 text-center text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
        id={`attribute-${attribute}`}
        max={99}
        min={minimum}
        onChange={(event) => {
          const nextValue = event.currentTarget.valueAsNumber;
          if (Number.isFinite(nextValue)) {
            onChange(attribute, Math.min(99, Math.max(minimum, nextValue)));
          }
        }}
        type="number"
        value={value}
      />
      <span className="sr-only" id={`attribute-${attribute}-minimum`}>
        Minimum {minimum} for the selected starting class
      </span>
    </div>
  );
}
