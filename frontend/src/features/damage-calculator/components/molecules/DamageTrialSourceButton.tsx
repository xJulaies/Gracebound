export function DamageTrialSourceButton({
  active,
  detail,
  iconUrl,
  label,
  onSelect,
}: {
  active: boolean;
  detail: string;
  iconUrl: string;
  label: string;
  onSelect: () => void;
}) {
  return (
    <button
      aria-pressed={active}
      className="damage-trial-source"
      data-selected={active}
      onClick={onSelect}
      type="button"
    >
      <img alt="" className="size-12 shrink-0 object-contain" src={iconUrl} />
      <span className="min-w-0 text-left">
        <span className="block truncate font-heading text-sm text-foreground">{label}</span>
        <span className="block text-xs text-foreground-muted">{detail}</span>
      </span>
    </button>
  );
}
