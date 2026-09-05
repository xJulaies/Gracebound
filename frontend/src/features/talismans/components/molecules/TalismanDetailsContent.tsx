import type { Talisman } from "../../types/talisman.types";
import { getTalismanEffectSections } from "../../domain/getTalismanEffectSections";

export function TalismanDetailsContent({ talisman }: { talisman: Talisman }) {
  const effectSections = getTalismanEffectSections(talisman.effects);

  return (
    <div className="grid gap-5 text-sm">
      <dl className="m-0 grid gap-4">
        {talisman.summary && (
          <div>
            <dt className="mb-1 uppercase tracking-wide text-accent">Effect</dt>
            <dd className="m-0 leading-6 text-foreground-muted">{talisman.summary}</dd>
          </div>
        )}
        <DetailRow label="Weight" value={talisman.weight} />
        <DetailRow
          label="Build calculations"
          value={talisman.calculationStatus === "supported" ? "Supported" : "Catalog only"}
        />
      </dl>

      {effectSections.map((section) => (
        <section key={section.title}>
          <h4 className="mb-2 text-sm uppercase tracking-wide text-accent">
            {section.title}
          </h4>
          <dl className="m-0">
            {section.entries.map((entry) => (
              <DetailRow
                key={`${entry.label}-${entry.value}`}
                label={entry.label}
                value={entry.value}
              />
            ))}
          </dl>
        </section>
      ))}
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="flex justify-between gap-4 border-b border-border/60 py-1">
      <dt className="text-foreground-muted">{label}</dt>
      <dd className="m-0 text-right text-foreground">{value}</dd>
    </div>
  );
}
