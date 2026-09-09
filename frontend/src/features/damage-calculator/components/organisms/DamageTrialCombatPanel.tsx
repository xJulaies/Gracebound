import { ApiError } from "../../../../shared/api/apiClient";
import { useState } from "react";
import type { DamageTrialLogEntry } from "../../types/damageTrial.types";
import { DamageTrialCombatLog } from "../molecules/DamageTrialCombatLog";
import { DamageTrialResultDetails } from "../molecules/DamageTrialResultDetails";

export function DamageTrialCombatPanel({
  canReset,
  error,
  isAttacking,
  log,
  onClearLog,
  onReset,
  onUndo,
}: {
  canReset: boolean;
  error: Error | null;
  isAttacking: boolean;
  log: DamageTrialLogEntry[];
  onClearLog: () => void;
  onReset: () => void;
  onUndo: () => void;
}) {
  const latestEntry = log.at(-1);
  const [selectedEntryId, setSelectedEntryId] = useState<string | null>(null);
  const selectedEntry = log.find(({ id }) => id === selectedEntryId);

  return (
    <section className="grid gap-5 border-t border-border pt-6" aria-label="Combat history">
      {(latestEntry || error) && <div aria-atomic="true" aria-live="polite">
        {latestEntry && (
          <p className="m-0 text-accent">
            {latestEntry.action.label} dealt <strong>{Math.round(latestEntry.result.damage.total).toLocaleString()} damage</strong>.
          </p>
        )}
        {error && (
          <p className="m-0 text-danger" role="alert">
            {error instanceof ApiError ? error.message : "The attack could not be calculated."}
          </p>
        )}
      </div>}

      <DamageTrialCombatLog
        entries={log}
        onInspect={(entryId) => setSelectedEntryId((current) => current === entryId ? null : entryId)}
        selectedEntryId={selectedEntryId}
      />
      {selectedEntry && <DamageTrialResultDetails entry={selectedEntry} />}
      <div className="flex flex-wrap justify-end gap-2">
        <button className="build-secondary-action" disabled={log.length === 0 || isAttacking} onClick={onUndo} type="button">
          Undo last attack
        </button>
        <button className="build-secondary-action" disabled={log.length === 0 || isAttacking} onClick={onClearLog} type="button">
          Clear log
        </button>
        <button className="build-danger-action" disabled={!canReset || isAttacking} onClick={onReset} type="button">
          Reset trial
        </button>
      </div>
    </section>
  );
}
