export function DamageTrialEffectToggle({
  active,
  description,
  iconUrl,
  label,
  onToggle,
}: {
  active: boolean;
  description: string;
  iconUrl?: string;
  label: string;
  onToggle: () => void;
}) {
  return (
    <button
      aria-pressed={active}
      className="damage-trial-effect-toggle"
      data-active={active}
      onClick={onToggle}
      type="button"
    >
      {iconUrl && <img alt="" className="size-12 shrink-0 object-contain" src={iconUrl} />}
      <span className="min-w-0 flex-1 text-left">
        <span className="block font-heading text-sm text-foreground">{label}</span>
        <span className="mt-1 block text-xs leading-5 text-foreground-muted">{description}</span>
      </span>
      <span aria-hidden="true" className="damage-trial-effect-toggle__state">
        {active ? "On" : "Off"}
      </span>
    </button>
  );
}
