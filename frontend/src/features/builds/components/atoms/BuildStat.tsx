import type { BuildStatHighlight } from "../../domain/getBuildStatHighlights";

export function BuildStat({ label, value }: BuildStatHighlight) {
  return (
    <div className="rounded-panel border border-border bg-background/45 px-3 py-2 text-center">
      <dt className="text-xs text-foreground-muted">{label}</dt>
      <dd className="m-0 font-heading text-lg text-accent">{value}</dd>
    </div>
  );
}
