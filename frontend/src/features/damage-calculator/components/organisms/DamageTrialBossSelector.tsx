import { ApiError } from "../../../../shared/api/apiClient";
import { useBossesQuery } from "../../../bosses/hooks/useBossesQuery";
import type { Boss } from "../../../bosses/types/boss.types";
import {
  formatBossSelectionLabel,
  formatCompactBossSelectionLabel,
} from "../../../bosses/domain/formatBossSelectionLabel";

export function DamageTrialBossSelector({
  onSelect,
  selectedBoss,
}: {
  onSelect: (boss: Boss | null) => void;
  selectedBoss: Boss | null;
}) {
  const query = useBossesQuery();
  const bosses = query.data?.data ?? [];

  if (query.isPending) {
    return <p className="damage-trial-state" role="status">Surveying possible foes…</p>;
  }

  if (query.isError) {
    return (
      <div className="damage-trial-state" role="alert">
        <p>{query.error instanceof ApiError ? query.error.message : "Bosses could not be loaded."}</p>
        <button className="build-secondary-action" onClick={() => void query.refetch()} type="button">
          Try again
        </button>
      </div>
    );
  }

  return (
    <section className="grid min-w-0 max-w-full gap-5 border-t border-border pt-6" aria-labelledby="damage-trial-target-heading">
      <div>
        <h2 className="mb-2 text-2xl" id="damage-trial-target-heading">Choose your opponent</h2>
        <p className="m-0 text-sm leading-6 text-foreground-muted">
          Enemy health and defenses form the target profile for every attack in this trial.
        </p>
      </div>
      <label className="grid min-w-0 max-w-2xl gap-2 md:hidden" htmlFor="damage-trial-boss-mobile">
        <span className="font-heading text-sm text-accent">Boss</span>
        <select
          className="min-h-11 min-w-0 w-full max-w-full rounded-panel border border-border bg-background px-3 py-2 text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
          id="damage-trial-boss-mobile"
          onChange={(event) => {
            onSelect(bosses.find((boss) => boss.id === event.target.value) ?? null);
          }}
          value={selectedBoss?.id ?? ""}
        >
          <option value="">Select a boss…</option>
          {bosses.map((boss) => (
            <option key={boss.id} value={boss.id}>{formatCompactBossSelectionLabel(boss)}</option>
          ))}
        </select>
      </label>
      <label className="hidden min-w-0 max-w-2xl gap-2 md:grid" htmlFor="damage-trial-boss-desktop">
        <span className="font-heading text-sm text-accent">Boss</span>
        <select
          className="min-h-11 min-w-0 w-full max-w-full rounded-panel border border-border bg-background px-4 py-2 text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
          id="damage-trial-boss-desktop"
          onChange={(event) => {
            onSelect(bosses.find((boss) => boss.id === event.target.value) ?? null);
          }}
          value={selectedBoss?.id ?? ""}
        >
          <option value="">Select a boss…</option>
          {bosses.map((boss) => (
            <option key={boss.id} value={boss.id}>{formatBossSelectionLabel(boss)}</option>
          ))}
        </select>
      </label>
    </section>
  );
}
