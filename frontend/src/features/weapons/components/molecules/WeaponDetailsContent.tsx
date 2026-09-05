import type { ReactNode } from "react";
import type { Weapon } from "../../types/weapon.types";

export function WeaponDetailsContent({ weapon }: { weapon: Weapon }) {
  const maxUpgradeLevels = [...new Set(
    weapon.variants.map(({ maxUpgradeLevel }) => maxUpgradeLevel),
  )].sort((left, right) => left - right);
  const requirements = nonZeroEntries(weapon.requirements);
  const statusBuildup = weapon.statusBuildup
    ? nonZeroEntries(weapon.statusBuildup)
    : [];
  const skillSectionTitle = weapon.canChangeAffinity
    ? "Compatible skills"
    : weapon.skills.length > 0
      ? "Unique skill"
      : "Skill";

  return (
    <div className="grid gap-5">
      <DetailSection title="Equipment">
        <dl className="m-0">
          <DetailRow label="Weight" value={weapon.weight} />
          <DetailRow
            label="Maximum upgrade"
            value={maxUpgradeLevels.map((level) => `+${level}`).join(" / ")}
          />
        </dl>
      </DetailSection>

      <DetailSection title="Required attributes">
        <dl className="m-0 grid gap-1">
          {requirements.map(([attribute, value]) => (
            <DetailRow key={attribute} label={formatLabel(attribute)} value={value} />
          ))}
        </dl>
      </DetailSection>

      {statusBuildup.length > 0 && (
        <DetailSection title="Status buildup">
          <dl className="m-0 grid gap-1">
            {statusBuildup.map(([status, value]) => (
              <DetailRow key={status} label={formatLabel(status)} value={value} />
            ))}
          </dl>
        </DetailSection>
      )}

      <DetailSection title={skillSectionTitle}>
        {weapon.skills.length > 0 ? (
          <ul className="m-0 grid list-none gap-3 p-0 text-sm text-foreground-muted">
            {weapon.skills.map((skill) => (
              <li className="grid gap-1" key={skill.id}>
                <strong className="font-heading text-foreground">{skill.name}</strong>
                {(skill.description ?? skill.summary) && (
                  <p className="m-0 whitespace-pre-line leading-6">
                    {skill.description ?? skill.summary}
                  </p>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <p className="mb-0 text-sm text-foreground-muted">
            {weapon.canChangeAffinity
              ? "Choose the armament to inspect compatible Ashes of War."
              : "No verified skill is available."}
          </p>
        )}
      </DetailSection>

      {weapon.castingTypes.length > 0 && (
        <DetailSection title="Casting">
          <p className="mb-0 text-sm text-foreground-muted">
            {weapon.castingTypes.map(formatLabel).join(", ")}
          </p>
        </DetailSection>
      )}
    </div>
  );
}

function DetailSection({
  children,
  title,
}: {
  children: ReactNode;
  title: string;
}) {
  return (
    <section>
      <h4 className="mb-2 text-sm uppercase tracking-wide text-accent">{title}</h4>
      {children}
    </section>
  );
}

function DetailRow({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="flex justify-between gap-4 border-b border-border/60 py-1 text-sm">
      <dt className="text-foreground-muted">{label}</dt>
      <dd className="m-0 text-foreground">{value}</dd>
    </div>
  );
}

function nonZeroEntries<T extends object>(values: T) {
  return (Object.entries(values) as Array<[keyof T & string, number]>).filter(
    ([, value]) => value > 0,
  );
}

function formatLabel(value: string) {
  return value
    .split("-")
    .map((part) => part[0]?.toUpperCase() + part.slice(1))
    .join(" ");
}
