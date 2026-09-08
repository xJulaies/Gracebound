import { useState } from "react";
import { ActionButton } from "../../../../shared/ui/atoms/ActionButton";
import type { BuildEditorFocus, EquippedWeapon } from "../../types/editor.types";
import type { Spell } from "../../../spells/types/spell.types";
import type { BuildStatsPreview } from "../../types/build.types";
import { getEquippedWeaponDisplayName } from "../../domain/getEquippedWeaponDisplayName";
import { StatusOverview } from "../molecules/StatusOverview";
import { StatusSectionTabs, type StatusSection } from "../molecules/StatusSectionTabs";
import type { SpellOffensePreview, WeaponOffensePreview } from "../../types/offensePreview.types";
import { AttributeRequirements } from "../../../../shared/ui/molecules/AttributeRequirements";
import { isDamageType } from "../../../../shared/domain/damageTypes";
import { DamageTypeStat } from "../../../../shared/ui/molecules/DamageTypeStat";

interface CalculatedStatsPanelProps {
  focusedWeapon: EquippedWeapon | null;
  focusedSpell: Spell | null;
  activeCatalyst: EquippedWeapon | null;
  focus: BuildEditorFocus | null;
  isError: boolean;
  errorMessage?: string;
  isPending: boolean;
  preview: BuildStatsPreview | null;
  offensePreview: WeaponOffensePreview | null;
  isOffensePending: boolean;
  isOffenseError: boolean;
  spellOffensePreview: SpellOffensePreview | null;
  isSpellOffensePending: boolean;
  isSpellOffenseError: boolean;
  onChangeFocusedSpell?: () => void;
}

export function CalculatedStatsPanel({
  focusedWeapon,
  focusedSpell,
  activeCatalyst,
  focus,
  isError,
  errorMessage,
  isPending,
  preview,
  offensePreview,
  isOffensePending,
  isOffenseError,
  spellOffensePreview,
  isSpellOffensePending,
  isSpellOffenseError,
  onChangeFocusedSpell,
}: CalculatedStatsPanelProps) {
  const [activeSection, setActiveSection] = useState<StatusSection>("offense");

  return (
    <aside aria-labelledby="calculated-stats-heading" className="build-editor-panel min-w-0">
      <header className="mb-5 border-b border-border pb-4">
        <h2 className="mb-1 text-2xl" id="calculated-stats-heading">Status</h2>
        <p className="mb-0 text-sm text-foreground-muted">
          {getFocusLabel(focus, focusedWeapon, focusedSpell)}
        </p>
      </header>

      {focusedSpell && onChangeFocusedSpell && (
        <ActionButton
          className="mb-4 w-full"
          onClick={onChangeFocusedSpell}
          type="button"
        >
          Change spell
        </ActionButton>
      )}

      {isPending && !preview && <p aria-live="polite">Calculating character status…</p>}
      {isError && (
        <p className="text-danger" role="alert">
          {errorMessage || "Character status is currently unavailable."}
        </p>
      )}
      {preview && (
        <>
          <StatusOverview preview={preview} />
          <StatusSectionTabs activeSection={activeSection} onChange={setActiveSection} />
          <div aria-labelledby={`status-${activeSection}-tab`} id={`status-${activeSection}-panel`} role="tabpanel">
            {activeSection === "offense" && (
              <StatSection heading="Attack power">
                {focusedSpell && (
                  <>
                    <StatRow label="Spell" value={focusedSpell.name} />
                    <StatRow label="Type" value={formatLabel(focusedSpell.type)} />
                    <StatRow label="FP cost" value={focusedSpell.fpCost} />
                    <StatRow label="Memory slots" value={focusedSpell.slotsRequired} />
                    <StatRow
                      label="Catalyst"
                      value={activeCatalyst
                        ? getEquippedWeaponDisplayName(activeCatalyst)
                        : "No compatible catalyst selected"}
                    />
                    <div className="mt-3">
                      <h4 className="mb-2 text-sm text-accent">Required attributes</h4>
                      <AttributeRequirements
                        currentStats={preview.effectiveStats}
                        requirements={focusedSpell.requirements}
                      />
                    </div>
                  </>
                )}
                {focusedSpell?.calculationStatus === "catalog-only" && (
                  <p className="mt-3 mb-0 text-sm text-foreground-muted">
                    This spell is catalogued, but its damage formula has not been verified yet.
                  </p>
                )}
                {focusedSpell?.attack && !activeCatalyst && (
                  <p className="mt-3 mb-0 text-sm text-foreground-muted">
                    Equip and select a compatible catalyst to calculate spell damage.
                  </p>
                )}
                {focusedSpell?.attack && activeCatalyst
                  && !activeCatalyst.weapon.castingTypes.includes(focusedSpell.type) && (
                  <p className="mt-3 mb-0 text-sm text-foreground-muted">
                    The active catalyst cannot cast this spell type.
                  </p>
                )}
                {focusedSpell && isSpellOffensePending && <p aria-live="polite">Calculating spell output…</p>}
                {focusedSpell && isSpellOffenseError && (
                  <p className="text-danger" role="alert">Spell output is currently unavailable.</p>
                )}
                {focusedSpell && spellOffensePreview?.actions.map((action) => (
                  <div className="mt-3 mb-3 last:mb-0" key={action.id}>
                    <h4 className="mb-1 text-sm text-foreground">{action.label}</h4>
                    <dl className="m-0">
                      <StatRow label="Spell scaling" value={action.attackRating} />
                      <StatRow label="Offensive output" value={action.offensiveOutput} />
                    </dl>
                  </div>
                ))}
                {!focusedWeapon && !focusedSpell && <p className="mb-0 text-sm text-foreground-muted">Select an equipped armament or spell to inspect it.</p>}
                {focusedWeapon && isOffensePending && <p aria-live="polite">Calculating armament output…</p>}
                {focusedWeapon && isOffenseError && <p className="text-danger" role="alert">Armament output is currently unavailable.</p>}
                {focusedWeapon && !isOffensePending && !isOffenseError && (!offensePreview || offensePreview.actions.length === 0) && (
                  <p className="mb-0 text-sm text-foreground-muted">This armament has no supported preview actions yet.</p>
                )}
                {focusedWeapon && (
                  <div className="mb-3">
                    <h4 className="mb-2 text-sm text-accent">Required attributes</h4>
                    <AttributeRequirements
                      currentStats={preview.effectiveStats}
                      requirements={focusedWeapon.weapon.requirements}
                    />
                  </div>
                )}
                {focusedWeapon && offensePreview?.actions.map((action) => (
                  <div className="mb-3 last:mb-0" key={action.id}>
                    <h4 className="mb-1 text-sm text-foreground">{action.label}</h4>
                    <dl className="m-0">
                      <StatRow label="Attack rating" value={action.attackRating} />
                      <StatRow label="Offensive output" value={action.offensiveOutput} />
                    </dl>
                  </div>
                ))}
              </StatSection>
            )}
            {activeSection === "defense" && (
              <>
                <StatSection heading="Defense">
                  {Object.entries(preview.defenses).map(([name, value]) => (
                    isDamageType(name) ? (
                      <DamageTypeStat
                        compact
                        key={name}
                        label={formatLabel(name)}
                        type={name}
                        value={value}
                      />
                    ) : <StatRow key={name} label={formatLabel(name)} value={value} />
                  ))}
                </StatSection>
                <StatSection heading="Damage negation">
                  {Object.entries(preview.damageNegation).map(([name, value]) => (
                    isDamageType(name) ? (
                      <DamageTypeStat
                        compact
                        key={name}
                        label={formatLabel(name)}
                        type={name}
                        value={`${formatDecimal(value * 100)}%`}
                      />
                    ) : (
                      <StatRow
                        key={name}
                        label={formatLabel(name)}
                        value={`${formatDecimal(value * 100)}%`}
                      />
                    )
                  ))}
                </StatSection>
              </>
            )}
            {activeSection === "resistances" && (
              <StatSection heading="Resistance">
                {Object.entries(preview.statusResistances).map(([name, value]) => (
                  <StatRow key={name} label={formatLabel(name)} value={value} />
                ))}
              </StatSection>
            )}
          </div>
        </>
      )}
    </aside>
  );
}

function getFocusLabel(
  focus: BuildEditorFocus | null,
  focusedWeapon: EquippedWeapon | null,
  focusedSpell: Spell | null,
) {
  if (focus?.kind === "spell" && focusedSpell) return focusedSpell.name;
  if (focus?.kind === "weapon" && focusedWeapon) {
    const role = focusedWeapon.weapon.castingTypes.length > 0 ? "Active catalyst" : "Active armament";
    return `${role}: ${getEquippedWeaponDisplayName(focusedWeapon)}`;
  }
  return "Select an equipped armament or spell to inspect it.";
}

function StatSection({ children, heading }: { children: React.ReactNode; heading: string }) {
  return (
    <section className="mb-5 last:mb-0">
      <h3 className="mb-2 text-base text-accent">{heading}</h3>
      <dl className="m-0">{children}</dl>
    </section>
  );
}

function StatRow({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-border/70 py-2 text-sm last:border-b-0">
      <dt className="text-foreground-muted">{label}</dt>
      <dd className="m-0 font-heading text-foreground">{value}</dd>
    </div>
  );
}

function formatLabel(value: string) {
  return value.replace(/([A-Z])/g, " $1").replace(/^./, (letter) => letter.toUpperCase());
}

function formatDecimal(value: number) {
  return Number(value.toFixed(2));
}
