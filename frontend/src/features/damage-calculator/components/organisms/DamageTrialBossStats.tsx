import { DamageTypeStat } from "../../../../shared/ui/molecules/DamageTypeStat";
import type { Boss } from "../../../bosses/types/boss.types";

export function DamageTrialBossStats({ boss }: { boss: Boss }) {
  return (
    <aside aria-labelledby="damage-trial-boss-stats-heading" className="damage-trial-boss-stats-panel damage-trial-side-panel">
      <div>
        <h2 className="mb-2 text-xl" id="damage-trial-boss-stats-heading">Boss defenses</h2>
        <p className="m-0 text-sm text-foreground-muted">Values applied to every confirmed hit.</p>
      </div>
      <dl className="grid gap-2 sm:grid-cols-2 xl:grid-cols-1">
        <DamageTypeStat compact label="Physical defense" type="physical" value={boss.defense.physical} />
        <DamageTypeStat compact label="Magic absorption" type="magic" value={`${boss.absorption.magic}%`} />
        <DamageTypeStat compact label="Fire absorption" type="fire" value={`${boss.absorption.fire}%`} />
        <DamageTypeStat compact label="Lightning absorption" type="lightning" value={`${boss.absorption.lightning}%`} />
        <DamageTypeStat compact label="Holy absorption" type="holy" value={`${boss.absorption.holy}%`} />
      </dl>
      <div>
        <h3 className="mb-3 text-base">Physical absorption</h3>
        <dl className="grid grid-cols-2 gap-2">
          <DamageTypeStat compact label="Standard" type="physical" value={`${boss.absorption.physical.standard}%`} />
          <DamageTypeStat compact label="Slash" type="physical" value={`${boss.absorption.physical.slash}%`} />
          <DamageTypeStat compact label="Strike" type="physical" value={`${boss.absorption.physical.strike}%`} />
          <DamageTypeStat compact label="Pierce" type="physical" value={`${boss.absorption.physical.pierce}%`} />
        </dl>
      </div>
    </aside>
  );
}
