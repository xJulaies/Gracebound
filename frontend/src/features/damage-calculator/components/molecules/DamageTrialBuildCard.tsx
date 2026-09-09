import { BuildStat } from "../../../builds/components/atoms/BuildStat";
import { getBuildStatHighlights } from "../../../builds/domain/getBuildStatHighlights";
import type { Build } from "../../../builds/types/build.types";

export function DamageTrialBuildCard({
  build,
  isSelected,
  onSelect,
}: {
  build: Build;
  isSelected: boolean;
  onSelect: (buildId: string) => void;
}) {
  const inputId = `damage-trial-build-${build.id}`;

  return (
    <label className="damage-trial-build-card" data-selected={isSelected} htmlFor={inputId}>
      <input
        checked={isSelected}
        className="sr-only"
        id={inputId}
        name="damage-trial-build"
        onChange={() => onSelect(build.id)}
        type="radio"
        value={build.id}
      />
      <span className="grid min-w-0 grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
        <span className="min-w-0 break-words text-xs uppercase leading-5 tracking-widest text-foreground-muted">
          Level {build.level} · {formatCharacterClass(build.characterClassId)}
        </span>
        <span className="damage-trial-build-card__marker" aria-hidden="true">
          {isSelected ? "Selected" : "Select"}
        </span>
      </span>
      <span className="block truncate font-heading text-xl text-foreground">{build.name}</span>
      <span className="line-clamp-2 min-h-12 text-sm leading-6 text-foreground-muted">
        {build.description || "No record notes have been added."}
      </span>
      <dl className="m-0 grid grid-cols-3 gap-2">
        {getBuildStatHighlights(build.stats).map((stat) => (
          <BuildStat key={stat.label} {...stat} />
        ))}
      </dl>
    </label>
  );
}

function formatCharacterClass(characterClassId: string | null) {
  if (!characterClassId) return "Custom origin";
  return characterClassId
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}
