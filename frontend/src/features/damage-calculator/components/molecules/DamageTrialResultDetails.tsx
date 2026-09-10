import { DamageTypeStat } from "../../../../shared/ui/molecules/DamageTypeStat";
import type { DamageBreakdown, DamageTrialLogEntry } from "../../types/damageTrial.types";

export function DamageTrialResultDetails({ entry }: { entry: DamageTrialLogEntry }) {
  const { result } = entry;
  const modifiers = [
    ...result.buffs.map(({ name }) => name),
    ...(result.greatRune ? [result.greatRune.name] : []),
    ...result.crystalTears.map(({ name }) => name),
    ...result.talismans.map(({ name }) => name),
  ];

  return (
    <div className="damage-trial-result-details">
      <header className="border-b border-border pb-3">
        <p className="mb-1 text-xs uppercase tracking-widest text-foreground-muted">
          Attack #{entry.sequence} · Estimated result
        </p>
        <h4 className="m-0 text-xl">{entry.action.label}</h4>
      </header>

      <div className="grid gap-5 xl:grid-cols-3">
        <DamageBreakdownGroup label="Attack rating" values={result.attackRating} />
        <DamageBreakdownGroup label="Before mitigation" values={result.offensiveOutput} />
        <DamageBreakdownGroup label="Direct damage" values={result.damage} />
      </div>

      {result.specialDamage.length > 0 && (
        <section aria-labelledby={`special-damage-${entry.id}`}>
          <div className="mb-2 flex items-center justify-between gap-3">
            <h5 className="m-0 text-base text-accent" id={`special-damage-${entry.id}`}>Special damage</h5>
            <strong>{formatNumber(result.totalDamage)} total damage</strong>
          </div>
          <ul className="m-0 grid list-none gap-2 p-0">
            {result.specialDamage.map((effect) => (
              <li className="flex justify-between gap-4 border-b border-border pb-2 text-sm" key={effect.id}>
                <span>{effect.name} · {effect.applicationCount} × {formatNumber(effect.damagePerApplication)} over {effect.durationSeconds}s</span>
                <strong>{formatNumber(effect.totalDamage)}</strong>
              </li>
            ))}
          </ul>
        </section>
      )}

      {result.components.length > 0 && (
        <section aria-labelledby={`components-${entry.id}`}>
          <h5 className="mb-2 text-base text-accent" id={`components-${entry.id}`}>Damage components</h5>
          <ul className="m-0 grid list-none gap-2 p-0">
            {result.components.map((component, index) => (
              <li className="flex justify-between gap-4 border-b border-border pb-2 text-sm" key={`${component.id ?? component.sourceAttackId}-${index}`}>
                <span>{component.label ?? component.kind}</span>
                <strong>{formatNumber(component.damage.total)} {component.outputUnit ?? "per-hit"}</strong>
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="grid gap-5 md:grid-cols-2">
        <section aria-labelledby={`modifiers-${entry.id}`}>
          <h5 className="mb-2 text-base text-accent" id={`modifiers-${entry.id}`}>Active modifiers</h5>
          {modifiers.length > 0 ? (
            <ul className="m-0 grid gap-1 pl-5 text-sm text-foreground-muted">
              {modifiers.map((modifier, index) => <li key={`${modifier}-${index}`}>{modifier}</li>)}
            </ul>
          ) : <p className="m-0 text-sm text-foreground-muted">No active modifiers reported.</p>}
        </section>
        <section aria-labelledby={`limitations-${entry.id}`}>
          <h5 className="mb-2 text-base text-accent" id={`limitations-${entry.id}`}>Calculation notes</h5>
          {result.limitations.length > 0 ? (
            <ul className="m-0 grid gap-1 pl-5 text-sm text-foreground-muted">
              {result.limitations.map((limitation) => <li key={limitation}>{limitation}</li>)}
            </ul>
          ) : <p className="m-0 text-sm text-foreground-muted">No additional limitations reported.</p>}
        </section>
      </div>
    </div>
  );
}

function DamageBreakdownGroup({ label, values }: { label: string; values: DamageBreakdown }) {
  return (
    <section>
      <div className="mb-2 flex items-center justify-between gap-3">
        <h5 className="m-0 text-base text-accent">{label}</h5>
        <strong>{formatNumber(values.total)}</strong>
      </div>
      <dl className="grid grid-cols-2 gap-2 sm:grid-cols-5 xl:grid-cols-2">
        <DamageTypeStat compact label="Physical" type="physical" value={formatNumber(values.physical)} />
        <DamageTypeStat compact label="Magic" type="magic" value={formatNumber(values.magic)} />
        <DamageTypeStat compact label="Fire" type="fire" value={formatNumber(values.fire)} />
        <DamageTypeStat compact label="Lightning" type="lightning" value={formatNumber(values.lightning)} />
        <DamageTypeStat compact label="Holy" type="holy" value={formatNumber(values.holy)} />
      </dl>
    </section>
  );
}

function formatNumber(value: number) {
  return Math.round(value).toLocaleString();
}
