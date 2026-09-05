import type { Armor } from "../../types/armor.types";

export function ArmorStatsGrid({ armor }: { armor: Armor }) {
  return (
    <div className="grid gap-5">
      <StatSection
        title="Equipment"
        values={{ Weight: armor.weight, Poise: armor.poise }}
      />
      <StatSection
        percentage
        title="Damage negation"
        values={armor.damageNegation}
      />
      <StatSection title="Resistances" values={armor.resistances} />
      {armor.hasPassiveEffects && (
        <p className="mb-0 rounded-panel border border-accent bg-accent/10 p-3 text-sm text-accent">
          This armor has a passive effect that contributes to calculated build stats.
        </p>
      )}
      {armor.hasUnresolvedPassiveEffects && (
        <p className="mb-0 rounded-panel border border-border bg-surface p-3 text-sm text-foreground-muted">
          Some passive effects are catalogued but not yet included in calculations.
        </p>
      )}
    </div>
  );
}

function StatSection({
  percentage = false,
  title,
  values,
}: {
  percentage?: boolean;
  title: string;
  values: Record<string, number>;
}) {
  return (
    <section>
      <h4 className="mb-2 text-sm uppercase tracking-wide text-accent">{title}</h4>
      <dl className="m-0 grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
        {Object.entries(values).map(([label, value]) => (
          <div className="flex justify-between gap-3 border-b border-border/60 py-1" key={label}>
            <dt className="capitalize text-foreground-muted">{formatLabel(label)}</dt>
            <dd className="m-0 text-foreground">
              {percentage ? `${(value * 100).toFixed(1)}%` : value}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

function formatLabel(value: string) {
  return value.replace(/([A-Z])/g, " $1").trim();
}
