import type { Build } from "../../../builds/types/build.types";
import type { Boss } from "../../../bosses/types/boss.types";
import { createActiveBossProfile } from "../../domain/createActiveBossProfile";
import { useDamageTrialSession } from "../../hooks/useDamageTrialSession";
import { useDamageTrialEffects } from "../../hooks/useDamageTrialEffects";
import { DamageTrialBossTarget } from "../molecules/DamageTrialBossTarget";
import { DamageTrialActionSelector } from "./DamageTrialActionSelector";
import { DamageTrialCombatPanel } from "./DamageTrialCombatPanel";
import { DamageTrialBossStats } from "./DamageTrialBossStats";
import { DamageTrialEffectsPanel } from "./DamageTrialEffectsPanel";

export function DamageTrialEncounter({ build, boss }: { build: Build; boss: Boss }) {
  const effects = useDamageTrialEffects(build);
  const session = useDamageTrialSession(build.id, boss, effects.selection);
  const activeBoss = createActiveBossProfile(
    boss,
    session.activePhase,
    session.currentMaximumHealth,
  );

  return (
    <div className="damage-trial-encounter-layout">
      <DamageTrialEffectsPanel effects={effects} />
      <div className="damage-trial-main-column grid min-w-0 gap-6">
        <DamageTrialBossTarget
          boss={activeBoss}
          currentHealth={session.currentHealth}
          lastHitId={session.log.at(-1)?.id}
        />
        {session.phaseTransition && (
          <div aria-live="assertive" className="damage-trial-phase-alert" role="status">
            <span>Encounter changed</span>
            <strong>{session.phaseTransition}</strong>
          </div>
        )}
        <DamageTrialActionSelector
          build={build}
          disabled={session.currentHealth === 0}
          isAttacking={session.mutation.isPending}
          onExecute={(action) => session.mutation.mutate(action)}
        />
        <DamageTrialCombatPanel
          canReset={session.currentHealth < session.currentMaximumHealth || session.log.length > 0}
          error={session.mutation.error}
          isAttacking={session.mutation.isPending}
          log={session.log}
          onClearLog={session.clearLog}
          onReset={session.resetTrial}
          onUndo={session.undoLastAttack}
        />
      </div>
      <DamageTrialBossStats boss={activeBoss} />
    </div>
  );
}
