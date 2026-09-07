import type { Spell } from "../../../spells/types/spell.types";
import type { CharacterStats } from "../../../../shared/types/game.types";
import { getUnmetAttributeRequirements } from "../../../../shared/domain/attributeRequirements";
import type { ActiveWeaponBuff, EquippedWeapon, WeaponEditorSlotId } from "../../types/editor.types";
import { BuffToggle } from "../molecules/BuffToggle";
import { EffectActivationControl } from "../molecules/EffectActivationControl";

export function BuffSimulationBar({
  activeIds,
  activeWeaponBuff,
  activeSkillBuffSlotId,
  catalyst,
  currentStats,
  onToggle,
  onToggleWeaponBuff,
  onToggleSkillBuff,
  spells,
  target,
  targetSlotId,
}: {
  activeIds: string[];
  activeWeaponBuff: ActiveWeaponBuff | null;
  activeSkillBuffSlotId: WeaponEditorSlotId | null;
  catalyst: EquippedWeapon | null;
  currentStats: CharacterStats | null;
  onToggle: (spell: Spell) => void;
  onToggleWeaponBuff: (spell: Spell) => void;
  onToggleSkillBuff: (active: boolean) => void;
  spells: Spell[];
  target: EquippedWeapon | null;
  targetSlotId: WeaponEditorSlotId | null;
}) {
  const generalBuffs = spells.filter(({ buffEffect }) => buffEffect?.slot === "aura" || buffEffect?.slot === "body");
  const weaponBuffs = spells.filter(({ buffEffect }) => buffEffect?.slot === "weapon");
  const skillBuff = target?.ashOfWar?.buffEffect ? target.ashOfWar : null;

  return (
    <section aria-labelledby="buff-simulation-heading" className="mt-7 rounded-panel border border-border bg-background/35 p-4">
      <h2 className="mb-2 text-xl" id="buff-simulation-heading">Active buffs</h2>
      <p className="mb-4 text-sm leading-6 text-foreground-muted">
        Aura and Body buffs stack. Activating another buff in the same category replaces the current one.
      </p>
      {generalBuffs.length === 0 && weaponBuffs.length === 0 && (
        <p className="mb-0 text-sm text-foreground-muted">Equip a buff spell to make it available here.</p>
      )}
      {generalBuffs.length > 0 && (
        <div className="grid gap-3 sm:grid-cols-2">
          {generalBuffs.map((spell) => (
            <BuffToggle
              active={activeIds.includes(spell.id)}
              key={spell.id}
              onToggle={() => onToggle(spell)}
              spell={spell}
            />
          ))}
        </div>
      )}
      {weaponBuffs.length > 0 && (
        <div className="mt-4 border-t border-border/60 pt-4">
          <h3 className="mb-2 text-sm text-accent">Weapon buffs</h3>
          <p className="mb-3 text-xs text-foreground-muted">
            Target: {target?.weapon.name ?? "select an armament"} · Catalyst: {catalyst?.weapon.name ?? "select a catalyst"}
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            {weaponBuffs.map((spell) => {
              const unavailableReason = getWeaponBuffUnavailableReason(spell, target, catalyst, currentStats);
              return (
                <BuffToggle
                  active={activeWeaponBuff?.spellId === spell.id
                    && activeWeaponBuff.targetSlotId === targetSlotId}
                  description={unavailableReason ?? `Weapon · ${spell.buffEffect?.durationSeconds ?? 0}s`}
                  disabled={unavailableReason !== null}
                  key={spell.id}
                  onToggle={() => onToggleWeaponBuff(spell)}
                  spell={spell}
                />
              );
            })}
          </div>
        </div>
      )}
      {skillBuff && targetSlotId && (
        <div className="mt-4 border-t border-border/60 pt-4">
          <h3 className="mb-2 text-sm text-accent">Armament skill buff</h3>
          <EffectActivationControl
            active={activeSkillBuffSlotId === targetSlotId}
            label={skillBuff.name}
            message={`${skillBuff.name} · ${formatConsumption(skillBuff.buffEffect!.consumption, skillBuff.buffEffect!.durationSeconds)}. Replaces an active spell weapon buff.`}
            onChange={onToggleSkillBuff}
          />
        </div>
      )}
    </section>
  );
}

function formatConsumption(consumption: "duration" | "next-hit", durationSeconds: number) {
  return consumption === "next-hit" ? "Consumed by the next hit" : `${durationSeconds}s duration`;
}

function getWeaponBuffUnavailableReason(
  spell: Spell,
  target: EquippedWeapon | null,
  catalyst: EquippedWeapon | null,
  currentStats: CharacterStats | null,
) {
  if (!target) return "Select the target armament";
  const variant = target.weapon.variants.find(({ id }) => id === target.variantId);
  if (variant?.canApplyWeaponBuff !== true) return "This armament configuration cannot receive weapon buffs";
  if (!catalyst) return "Select a compatible catalyst";
  if (!catalyst.weapon.castingTypes.includes(spell.type)) return `Requires an active ${spell.type} catalyst`;
  if (!currentStats) return "Character attributes are unavailable";
  if (getUnmetAttributeRequirements(spell.requirements, currentStats).length > 0) {
    return "Spell requirements are not met";
  }
  if (getUnmetAttributeRequirements(catalyst.weapon.requirements, currentStats).length > 0) {
    return "Catalyst requirements are not met";
  }
  return null;
}
