import { useState } from "react";
import type { Build } from "../../../builds/types/build.types";
import { useDamageTrialActionsQuery } from "../../hooks/useDamageTrialActionsQuery";
import type { DamageTrialAction, DamageTrialActionOption } from "../../types/damageTrial.types";
import { DamageTrialActionButton } from "../molecules/DamageTrialActionButton";
import { DamageTrialSourceButton } from "../molecules/DamageTrialSourceButton";

export function DamageTrialActionSelector({ build, disabled, isAttacking, onExecute }: {
  build: Build;
  disabled: boolean;
  isAttacking: boolean;
  onExecute: (action: DamageTrialAction) => void;
}) {
  const query = useDamageTrialActionsQuery(build);
  const [selectedSourceId, setSelectedSourceId] = useState<string | null>(null);

  if (query.isPending) return <p className="damage-trial-state" role="status">Preparing available armaments…</p>;
  if (query.isError) {
    return (
      <div className="damage-trial-state" role="alert">
        <p>The saved loadout could not be prepared for combat.</p>
        <button className="build-secondary-action" onClick={() => void query.refetch()} type="button">Try again</button>
      </div>
    );
  }

  const options = query.data;
  if (options.length === 0) {
    return <p className="damage-trial-state">This build has no supported armament attacks or compatible damaging spells.</p>;
  }
  const sources = getSources(options);
  const selectedOptions = selectedSourceId
    ? options.filter((option) => getOptionSourceId(option) === selectedSourceId)
    : [];

  function chooseSource(sourceId: string) {
    setSelectedSourceId(sourceId);
  }

  return (
    <section className="grid gap-6 border-t border-border pt-6" aria-labelledby="damage-trial-actions-heading">
      <div>
        <h2 className="mb-2 text-2xl" id="damage-trial-actions-heading">Choose weapon</h2>
        <p className="m-0 text-sm leading-6 text-foreground-muted">
          Select an equipped armament first, then choose one of its supported attacks.
        </p>
      </div>
      <SourceGroup label="Armaments" onSelect={chooseSource} selectedSourceId={selectedSourceId} sources={sources} />
      <p aria-live="polite" className="m-0 min-h-5 text-sm text-foreground-muted">
        {disabled ? "Enemy felled. Reset the trial to attack again." : isAttacking ? "Calculating damage…" : ""}
      </p>
      {selectedSourceId && (
        <div className="grid gap-3 border-t border-border pt-5">
          <h3 className="m-0 text-lg text-accent">
            {selectedOptions.every(({ group }) => group === "spell") ? "Available spells" : "Available attacks"}
          </h3>
          <div className="damage-trial-action-grid">
            {selectedOptions.map((option) => (
              <DamageTrialActionButton
                disabled={disabled || isAttacking}
                key={option.id}
                onExecute={({ action }) => onExecute(action)}
                option={option}
              />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

interface DamageTrialSource {
  id: string;
  label: string;
  iconUrl: string;
  detail: string;
}

function SourceGroup({ label, onSelect, selectedSourceId, sources }: {
  label: string;
  onSelect: (sourceId: string) => void;
  selectedSourceId: string | null;
  sources: DamageTrialSource[];
}) {
  if (sources.length === 0) return null;
  return (
    <div className="grid gap-3">
      <h3 className="m-0 text-lg text-accent">{label}</h3>
      <div className="damage-trial-source-grid">
        {sources.map((source) => (
          <DamageTrialSourceButton
            active={selectedSourceId === source.id}
            detail={source.detail}
            iconUrl={source.iconUrl}
            key={source.id}
            label={source.label}
            onSelect={() => onSelect(source.id)}
          />
        ))}
      </div>
    </div>
  );
}

function getSources(options: DamageTrialActionOption[]): DamageTrialSource[] {
  return [...new Map(options.map((option) => {
    return [option.sourceId, {
      id: option.sourceId,
      label: option.sourceLabel,
      iconUrl: option.sourceIconUrl,
      detail: option.sourceDetail,
    }];
  })).values()];
}

function getOptionSourceId(option: DamageTrialActionOption) {
  return option.sourceId;
}
