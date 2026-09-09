import type { DamageTrialActionOption } from "../../types/damageTrial.types";

export function DamageTrialActionButton({
  disabled,
  onExecute,
  option,
}: {
  disabled: boolean;
  onExecute: (option: DamageTrialActionOption) => void;
  option: DamageTrialActionOption;
}) {
  return (
    <button
      className="damage-trial-action"
      disabled={disabled}
      onClick={() => onExecute(option)}
      type="button"
    >
      <img alt="" aria-hidden="true" className="size-14 shrink-0 object-contain" src={option.iconUrl} />
      <span className="min-w-0 text-left">
        <span className="block font-heading text-base text-foreground">{option.action.label}</span>
        <span className="block truncate text-sm text-accent">{option.sourceName}</span>
        <span className="block text-xs text-foreground-muted">{option.detail}</span>
      </span>
    </button>
  );
}
