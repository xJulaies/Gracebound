import type { Build } from "../../../builds/types/build.types";
import { DamageTrialBuildCard } from "../molecules/DamageTrialBuildCard";

export function DamageTrialBuildSelector({
  builds,
  selectedBuildId,
  onSelect,
}: {
  builds: Build[];
  selectedBuildId: string | null;
  onSelect: (buildId: string) => void;
}) {
  return (
    <fieldset className="m-0 grid gap-5 border-0 p-0">
      <legend className="mb-2 font-heading text-2xl text-foreground">Choose your build</legend>
      <p className="m-0 text-sm leading-6 text-foreground-muted">
        Select one of your saved records. The trial always uses its persisted equipment, attributes, spells, and upgrades.
      </p>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {builds.map((build) => (
          <DamageTrialBuildCard
            build={build}
            isSelected={selectedBuildId === build.id}
            key={build.id}
            onSelect={onSelect}
          />
        ))}
      </div>
    </fieldset>
  );
}
