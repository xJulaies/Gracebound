import { Link } from "@tanstack/react-router";
import { formatBossLabel } from "../../domain/formatBossLabel";
import type { Boss } from "../../types/boss.types";
import type { DamageType } from "../../../../shared/domain/damageTypes";
import { DamageTypeStat } from "../../../../shared/ui/molecules/DamageTypeStat";

export function BossDetails({ boss }: { boss: Boss }) {
  const defenses = [
    ["Physical", boss.defense.physical, "physical"],
    ["Magic", boss.defense.magic, "magic"],
    ["Fire", boss.defense.fire, "fire"],
    ["Lightning", boss.defense.lightning, "lightning"],
    ["Holy", boss.defense.holy, "holy"],
  ] as const;
  const absorptions = [
    ["Standard", boss.absorption.physical.standard, "physical"],
    ["Slash", boss.absorption.physical.slash, "physical"],
    ["Strike", boss.absorption.physical.strike, "physical"],
    ["Pierce", boss.absorption.physical.pierce, "physical"],
    ["Magic", boss.absorption.magic, "magic"],
    ["Fire", boss.absorption.fire, "fire"],
    ["Lightning", boss.absorption.lightning, "lightning"],
    ["Holy", boss.absorption.holy, "holy"],
  ] as const;

  return (
    <article className="py-6">
      <Link
        className="build-secondary-action mb-6 inline-flex"
        search={{ search: "" }}
        to="/bosses"
      >
        Back to bosses
      </Link>
      <header className="mb-8 border-b border-border pb-6">
        <div className="mb-3 flex flex-wrap gap-2 text-sm text-foreground-muted">
          {boss.rank && <Tag>{formatBossLabel(boss.rank)}</Tag>}
          {boss.progression && <Tag>{formatBossLabel(boss.progression)}</Tag>}
          {boss.rewardsGreatRune && <Tag>Great Rune</Tag>}
          {boss.rewardsRemembrance && <Tag>Remembrance</Tag>}
        </div>
        <h1 className="mb-3 text-3xl sm:text-5xl">{boss.name}</h1>
        <p className="m-0 text-xl text-accent">{boss.health.toLocaleString()} HP</p>
      </header>

      <div className="grid gap-6 lg:grid-cols-2">
        <DetailSection title="Encounters">
          {boss.encounters.length > 0 ? (
            <ul className="m-0 grid list-none gap-3 p-0">
              {boss.encounters.map((encounter, index) => (
                <li className="rounded-panel border border-border bg-background/40 p-4" key={`${encounter.region}-${encounter.location ?? index}`}>
                  <strong className="block text-accent">{formatBossLabel(encounter.region)}</strong>
                  <span className="text-foreground-muted">
                    {encounter.location ?? "Exact location unclassified"}
                    {encounter.locationType && ` · ${formatBossLabel(encounter.locationType)}`}
                  </span>
                </li>
              ))}
            </ul>
          ) : <p className="text-foreground-muted">Encounter details unavailable.</p>}
        </DetailSection>

        <DetailSection title="Defense">
          <StatGrid values={defenses} />
        </DetailSection>

        <DetailSection title="Damage absorption">
          <StatGrid suffix="%" values={absorptions} />
        </DetailSection>

        <DetailSection title="Rewards and progression">
          <dl className="grid gap-3 sm:grid-cols-2">
            <DetailRow label="Classification" value={boss.rank ? formatBossLabel(boss.rank) : "Unclassified"} />
            <DetailRow label="Progression" value={boss.progression ? formatBossLabel(boss.progression) : "Unclassified"} />
            <DetailRow label="Great Rune" value={formatKnownBoolean(boss.rewardsGreatRune)} />
            <DetailRow label="Remembrance" value={formatKnownBoolean(boss.rewardsRemembrance)} />
          </dl>
        </DetailSection>
      </div>
    </article>
  );
}

function DetailSection({ children, title }: { children: React.ReactNode; title: string }) {
  return (
    <section className="m-0 rounded-panel border border-border bg-surface-elevated p-5 sm:p-6">
      <h2 className="mb-5 text-2xl">{title}</h2>
      {children}
    </section>
  );
}

function StatGrid({ suffix = "", values }: {
  suffix?: string;
  values: readonly (readonly [string, number, DamageType])[];
}) {
  return (
    <dl className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {values.map(([label, value, type]) => (
        <DamageTypeStat
          key={label}
          label={label}
          type={type}
          value={`${value}${suffix}`}
        />
      ))}
    </dl>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-panel border border-border bg-background/40 p-3">
      <dt className="text-sm text-foreground-muted">{label}</dt>
      <dd className="mt-1 text-lg text-foreground">{value}</dd>
    </div>
  );
}

function Tag({ children }: { children: React.ReactNode }) {
  return <span className="rounded-panel border border-border bg-surface-elevated px-3 py-1">{children}</span>;
}

function formatKnownBoolean(value: boolean | null): string {
  if (value === null) return "Unclassified";
  return value ? "Yes" : "No";
}
