import { formatBossLabel } from "../../domain/formatBossLabel";
import type { Boss } from "../../types/boss.types";
import { DamageTypeStat } from "../../../../shared/ui/molecules/DamageTypeStat";
import { BossPortrait } from "../atoms/BossPortrait";

export function BossCatalogCard({ boss }: { boss: Boss }) {
  return (
    <article className="group relative flex h-full min-w-0 flex-col rounded-panel border border-border bg-surface-elevated p-5 shadow-lg shadow-background/25 transition-all duration-300 hover:-translate-y-1 hover:border-accent hover:shadow-xl focus-within:-translate-y-1 focus-within:border-focus focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-focus">
      <Link
        aria-label={`View details for ${boss.name}`}
        className="absolute inset-0 z-10 cursor-pointer rounded-panel"
        params={{ bossId: boss.id }}
        to="/bosses/$bossId"
      />
      <div className="mb-4 flex items-start gap-4">
        <BossPortrait bossName={boss.name} className="size-20 shrink-0" imageUrl={boss.imageUrl} />
        <div className="flex min-w-0 flex-wrap gap-2 text-xs text-foreground-muted">
        {boss.rank && <BossTag>{formatBossLabel(boss.rank)}</BossTag>}
        {boss.progression && <BossTag>{formatBossLabel(boss.progression)}</BossTag>}
        {boss.rewardsGreatRune && <BossTag>Great Rune</BossTag>}
        {boss.rewardsRemembrance && <BossTag>Remembrance</BossTag>}
        </div>
      </div>
      <h2 className="mb-3 text-xl leading-tight wrap-break-word">{boss.name}</h2>
      <p className="mb-4 text-sm text-accent">{boss.health.toLocaleString()} HP</p>
      {boss.encounters.length > 0 ? (
        <ul aria-label={`${boss.name} encounters`} className="mb-5 grid list-none gap-2 p-0">
          {boss.encounters.map((encounter, index) => (
            <li className="text-sm leading-6 text-foreground-muted" key={`${encounter.region}-${encounter.location ?? index}`}>
              <span className="text-foreground">{formatBossLabel(encounter.region)}</span>
              {encounter.location && ` · ${encounter.location}`}
              {encounter.locationType && ` · ${formatBossLabel(encounter.locationType)}`}
            </li>
          ))}
        </ul>
      ) : (
        <p className="mb-5 text-sm text-foreground-muted">Encounter details unavailable</p>
      )}
      <dl className="mt-auto grid grid-cols-2 gap-x-4 gap-y-2 border-t border-border pt-4 text-sm">
        <DamageTypeStat compact label="Physical defense" type="physical" value={boss.defense.physical} />
        <DamageTypeStat compact label="Magic absorb." type="magic" value={`${boss.absorption.magic}%`} />
        <DamageTypeStat compact label="Fire absorb." type="fire" value={`${boss.absorption.fire}%`} />
        <DamageTypeStat compact label="Lightning absorb." type="lightning" value={`${boss.absorption.lightning}%`} />
        <DamageTypeStat compact label="Holy absorb." type="holy" value={`${boss.absorption.holy}%`} />
      </dl>
    </article>
  );
}

function BossTag({ children }: { children: React.ReactNode }) {
  return <span className="rounded-panel border border-border bg-background px-2 py-1">{children}</span>;
}

import { Link } from "@tanstack/react-router";
