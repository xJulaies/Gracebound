import { formatBossLabel } from "../../../bosses/domain/formatBossLabel";
import type { Boss } from "../../../bosses/types/boss.types";
import { BossPortrait } from "../../../bosses/components/atoms/BossPortrait";
import { BossHealthBar } from "./BossHealthBar";

export function DamageTrialBossTarget({ boss, currentHealth = boss.health, lastHitId }: {
  boss: Boss;
  currentHealth?: number;
  lastHitId?: string;
}) {
  const encounter = boss.encounters[0];

  return (
    <article className="damage-trial-boss-target">
      <div className="grid min-w-0 grid-cols-[auto_minmax(0,1fr)] items-center gap-3 md:gap-5">
        <BossPortrait
          bossName={boss.name}
          className="damage-trial-boss-portrait"
          imageUrl={boss.imageUrl}
          key={lastHitId ?? "initial"}
          showImpact={Boolean(lastHitId)}
        />
        <div className="grid min-w-0 gap-3">
          <BossHealthBar currentHealth={currentHealth} hitId={lastHitId} maximumHealth={boss.health} name={boss.name} />
          <p className="m-0 hidden text-sm text-foreground-muted md:block">
            {encounter
              ? `${formatBossLabel(encounter.region)}${encounter.location ? ` · ${encounter.location}` : ""}`
              : "Encounter location unavailable"}
          </p>
        </div>
      </div>
    </article>
  );
}
