import type { DamageTrialEffectsController } from "../../hooks/useDamageTrialEffects";
import { DamageTrialEffectToggle } from "../molecules/DamageTrialEffectToggle";

export function DamageTrialEffectsPanel({ effects }: { effects: DamageTrialEffectsController }) {
  const hasEffects = effects.greatRune || effects.crystalTears.length > 0 || effects.buffs.length > 0 || effects.weaponBuff;

  return (
    <aside aria-labelledby="damage-trial-effects-heading" className="damage-trial-side-panel">
      <div>
        <h2 className="mb-2 text-xl" id="damage-trial-effects-heading">Active effects</h2>
        <p className="m-0 text-sm leading-6 text-foreground-muted">
          Toggle saved effects for this trial without changing the build.
        </p>
      </div>
      {effects.isLoading && <p className="m-0 text-sm text-foreground-muted" role="status">Recovering effects…</p>}
      {!effects.isLoading && !hasEffects && <p className="m-0 text-sm text-foreground-muted">This build has no optional effects.</p>}
      {effects.greatRune && (
        <DamageTrialEffectToggle
          active={effects.selection.greatRuneActive}
          description="Rune Arc effect"
          iconUrl={effects.greatRune.iconUrl}
          label={effects.greatRune.name}
          onToggle={effects.toggleGreatRune}
        />
      )}
      {effects.crystalTears.length > 0 && (
        <DamageTrialEffectToggle
          active={effects.selection.wondrousPhysickActive}
          description={effects.crystalTears.map(({ name }) => name).join(" + ")}
          iconUrl={effects.crystalTears[0]?.iconUrl}
          label="Wondrous Physick"
          onToggle={effects.togglePhysick}
        />
      )}
      {(effects.buffs.length > 0 || effects.weaponBuff) && (
        <div className="grid gap-3 border-t border-border pt-4">
          <h3 className="m-0 text-base text-accent">Buffs</h3>
          {effects.buffs.map((spell) => (
            <DamageTrialEffectToggle
              active={effects.selection.activeBuffSpellIds.includes(spell.id)}
              description={`${formatBuffSlot(spell.buffEffect?.slot)} buff`}
              iconUrl={spell.iconUrl}
              key={spell.id}
              label={spell.name}
              onToggle={() => effects.toggleBuff(spell.id)}
            />
          ))}
          {effects.weaponBuff && (
            <DamageTrialEffectToggle
              active={effects.selection.weaponBuffActive}
              description="Armament buff"
              iconUrl={effects.weaponBuff.iconUrl}
              label={effects.weaponBuff.name}
              onToggle={effects.toggleWeaponBuff}
            />
          )}
        </div>
      )}
    </aside>
  );
}

function formatBuffSlot(slot: "aura" | "body" | "weapon" | undefined) {
  if (!slot) return "General";
  return `${slot.charAt(0).toUpperCase()}${slot.slice(1)}`;
}
