import type { Spell } from "../../types/spell.types";
import { formatSpellLabel } from "../../domain/formatSpellLabel";

export function SpellDetailsContent({ spell }: { spell: Spell }) {
  const requirements = Object.entries(spell.requirements)
    .filter(([, value]) => value > 0);

  return (
    <div className="grid gap-5">
      <section aria-labelledby="spell-cost-heading">
        <h4 className="mb-2 text-lg" id="spell-cost-heading">Casting</h4>
        <dl className="m-0 grid grid-cols-2 gap-2 text-sm">
          <Detail label="FP cost" value={spell.fpCost} />
          <Detail label="Memory slots" value={spell.slotsRequired} />
          {spell.chargedFpCost !== null && (
            <Detail label="Charged FP" value={spell.chargedFpCost} />
          )}
          {spell.sustainedFpCost !== null && (
            <Detail label="Sustained FP" value={spell.sustainedFpCost} />
          )}
        </dl>
      </section>
      <section aria-labelledby="spell-requirements-heading">
        <h4 className="mb-2 text-lg" id="spell-requirements-heading">Required attributes</h4>
        {requirements.length > 0 ? (
          <dl className="m-0 grid grid-cols-2 gap-2 text-sm">
            {requirements.map(([attribute, value]) => (
              <Detail key={attribute} label={formatSpellLabel(attribute)} value={value} />
            ))}
          </dl>
        ) : <p className="mb-0 text-sm text-foreground-muted">No attribute requirements.</p>}
      </section>
      <section aria-labelledby="spell-support-heading">
        <h4 className="mb-2 text-lg" id="spell-support-heading">Gracebound support</h4>
        <p className="mb-0 text-sm text-foreground-muted">
          {spell.calculationStatus === "supported"
            ? "Damage or buff calculation is supported."
            : "Catalog information only; calculation is not yet supported."}
        </p>
        {spell.buffEffect && (
          <p className="mt-2 mb-0 text-sm text-foreground-muted">
            {`${formatSpellLabel(spell.buffEffect.slot)} buff · ${spell.buffEffect.durationSeconds} seconds`}
          </p>
        )}
      </section>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex justify-between gap-3 border-b border-border py-1">
      <dt className="text-foreground-muted">{label}</dt>
      <dd className="m-0 text-foreground">{value}</dd>
    </div>
  );
}
