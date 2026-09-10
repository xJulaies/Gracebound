import type { DamageTrialLogEntry } from "../../types/damageTrial.types";

export function DamageTrialCombatLog({
  entries,
  onInspect,
  selectedEntryId,
}: {
  entries: DamageTrialLogEntry[];
  onInspect: (entryId: string) => void;
  selectedEntryId: string | null;
}) {
  const totalDamage = entries.reduce((sum, entry) => sum + entry.result.totalDamage, 0);

  return (
    <section className="damage-trial-log" aria-labelledby="damage-trial-log-heading">
      <div className="flex items-end justify-between gap-4 border-b border-border pb-3">
        <h3 className="m-0 text-lg" id="damage-trial-log-heading">Combat log</h3>
        <span className="text-sm text-foreground-muted">Total {formatDamage(totalDamage)}</span>
      </div>
      {entries.length === 0 ? (
        <p className="m-0 text-sm text-foreground-muted">No attacks performed yet.</p>
      ) : (
        <ol className="m-0 grid max-h-72 list-none gap-2 overflow-y-auto p-0" aria-live="polite">
          {[...entries].reverse().map((entry) => (
            <li className="grid grid-cols-[auto_1fr_auto] items-center gap-3 rounded-panel border border-border bg-background/45 p-3 sm:grid-cols-[auto_1fr_auto_auto]" key={entry.id}>
              <span className="text-xs text-foreground-muted">#{entry.sequence}</span>
              <span className="min-w-0">
                <span className="block truncate text-sm text-foreground">{entry.action.label}</span>
                <span className="block text-xs text-foreground-muted">{getSourceName(entry)}</span>
                {entry.phaseTransition && (
                  <span className="mt-1 block text-xs text-accent">→ {entry.phaseTransition}</span>
                )}
              </span>
              <strong className="font-heading text-danger">−{formatDamage(entry.result.totalDamage)}</strong>
              <button
                aria-expanded={selectedEntryId === entry.id}
                className="damage-trial-log-action col-span-3 sm:col-span-1"
                onClick={() => onInspect(entry.id)}
                type="button"
              >
                {selectedEntryId === entry.id ? "Hide" : "Details"}
              </button>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}

function getSourceName(entry: DamageTrialLogEntry) {
  if ("weapon" in entry.result) return entry.result.weapon.name;
  return entry.result.spell.name;
}

function formatDamage(value: number) {
  return Math.round(value).toLocaleString();
}
