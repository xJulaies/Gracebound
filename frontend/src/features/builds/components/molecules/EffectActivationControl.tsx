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
      <button
        aria-pressed={active}
        className="w-full rounded-panel border border-accent bg-accent px-4 py-3 font-heading text-sm text-background shadow-md transition-[background-color,color,box-shadow,transform] hover:bg-accent-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent active:translate-y-px disabled:cursor-not-allowed disabled:border-border disabled:bg-surface disabled:text-foreground-muted disabled:shadow-none sm:w-fit"
        disabled={disabled}
        onClick={() => onChange(!active)}
        type="button"
      >
        {active ? `Deactivate ${label}` : `Activate ${label}`}
      </button>
    </div>
  );
}
