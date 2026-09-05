import type { EquippedWeapon, WeaponEditorFocus } from "../../types/editor.types";
import type { BuildStatsPreview } from "../../types/build.types";
import { getEquippedWeaponDisplayName } from "../../domain/getEquippedWeaponDisplayName";

interface CalculatedStatsPanelProps {
  focusedWeapon: EquippedWeapon | null;
  focus: WeaponEditorFocus | null;
  isError: boolean;
  isPending: boolean;
  preview: BuildStatsPreview | null;
}

export function CalculatedStatsPanel({
  focusedWeapon,
  focus,
  isError,
  isPending,
  preview,
}: CalculatedStatsPanelProps) {
  return (
    <aside aria-labelledby="calculated-stats-heading" className="build-editor-panel min-w-0">
      <header className="mb-5 border-b border-border pb-4">
        <h2 className="mb-1 text-2xl" id="calculated-stats-heading">Status</h2>
        <p className="mb-0 text-sm text-foreground-muted">
          {focusedWeapon && focus
            ? getEquippedWeaponDisplayName(focusedWeapon)
            : "Select an equipped armament to inspect its actions."}
        </p>
      </header>

      {isPending && !preview && <p aria-live="polite">Calculating character status…</p>}
      {isError && <p role="alert">Character status is currently unavailable.</p>}
      {preview && (
        <>
          <StatSection heading="Resources">
            <StatRow label="HP" value={preview.resources.maxHp} />
            <StatRow label="FP" value={preview.resources.maxFp} />
            <StatRow label="Stamina" value={preview.resources.maxStamina} />
            <StatRow label="Equip load" value={preview.resources.maxEquipLoad} />
          </StatSection>
          <StatSection heading="Attack power">
            <StatRow label="Light attack (R1)" value="—" />
            <StatRow label="Heavy attack (R2)" value="—" />
            <StatRow label="Jump attack" value="—" />
            <StatRow label="Skill" value="—" />
            <p className="mt-2 mb-0 text-xs leading-5 text-foreground-muted">
              Action damage will follow when the focused armament is connected to
              the damage endpoint.
            </p>
          </StatSection>
          <StatSection heading="Defense">
            {Object.entries(preview.defenses).map(([name, value]) => (
              <StatRow key={name} label={formatLabel(name)} value={value} />
            ))}
          </StatSection>
          <StatSection heading="Resistance">
            {Object.entries(preview.statusResistances).map(([name, value]) => (
              <StatRow key={name} label={formatLabel(name)} value={value} />
            ))}
          </StatSection>
        </>
      )}
    </aside>
  );
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
