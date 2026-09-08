export function BuildStat({
  accessibleLabel,
  label,
  value,
}: {
  accessibleLabel?: string;
  label: string;
  value: number | string;
}) {
  return (
    <div className="rounded-panel border border-border bg-background/45 px-3 py-2 text-center">
      <dt
        aria-label={accessibleLabel}
        className="text-xs text-foreground-muted"
        title={accessibleLabel}
      >
        {label}
      </dt>
      <dd className="m-0 font-heading text-lg text-accent">{value}</dd>
    </div>
  );
}
