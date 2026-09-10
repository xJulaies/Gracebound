import { ApiError } from "../../../../shared/api/apiClient";
import { useBossesQuery } from "../../../bosses/hooks/useBossesQuery";
import type { Boss } from "../../../bosses/types/boss.types";
import {
  formatBossSelectionLabel,
  formatCompactBossSelectionLabel,
} from "../../../bosses/domain/formatBossSelectionLabel";
import { ResponsiveSelect } from "../../../../shared/ui/molecules/ResponsiveSelect";

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
      <div className="min-w-0 max-w-2xl [&>span]:font-heading [&>span]:text-accent">
        <ResponsiveSelect
          emptyLabel="Select a boss…"
          label="Boss"
          onChange={(value) => onSelect(bosses.find((boss) => boss.id === value) ?? null)}
          options={bosses.map((boss) => ({
            value: boss.id,
            label: formatBossSelectionLabel(boss),
            compactLabel: formatCompactBossSelectionLabel(boss),
          }))}
          value={selectedBoss?.id ?? ""}
        />
      </div>
    </section>
  );
}
