import { ActionButton } from "../../../../shared/ui/atoms/ActionButton";

interface EffectActivationControlProps {
  active: boolean;
  disabled?: boolean;
  label: string;
  onChange: (active: boolean) => void;
  message?: string;
}

export function EffectActivationControl({
  active,
  disabled = false,
  label,
  onChange,
  message,
}: EffectActivationControlProps) {
  return (
    <div className="col-span-full grid min-w-0 gap-3 border-t border-border/60 pt-3">
      <span className="min-w-0 text-sm leading-5 text-foreground-muted">
        {message ?? (active ? "Included in simulation" : "Not included in simulation")}
      </span>
      <ActionButton
        aria-pressed={active}
        className="w-full sm:w-fit"
        disabled={disabled}
        onClick={() => onChange(!active)}
        type="button"
      >
        {active ? `Deactivate ${label}` : `Activate ${label}`}
      </ActionButton>
    </div>
  );
}
