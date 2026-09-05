import { getBuildStatHighlights } from "../../domain/getBuildStatHighlights";
import type { Build } from "../../types/build.types";
import { BuildStat } from "../atoms/BuildStat";

export function PublicBuildCard({ build }: { build: Build }) {
  const highlightedStats = getBuildStatHighlights(build.stats);

  return (
    <article className="public-build-card">
      <div>
        <p className="mb-1 text-xs text-foreground-muted uppercase tracking-wider">
          Level {build.level}
        </p>
        <h3 className="mb-2 text-xl">{build.name}</h3>
        <p className="mb-0 text-sm leading-6 text-foreground-muted">
          {build.description || "A Tarnished build shared with the community."}
        </p>
      </div>

      <div>
        <p className="mb-2 text-xs text-foreground-muted uppercase tracking-wider">
          {formatCharacterClass(build.characterClassId)}
        </p>
        <dl className="m-0 grid grid-cols-3 gap-2">
          {highlightedStats.map((stat) => (
            <BuildStat key={stat.label} {...stat} />
          ))}
        </dl>
      </div>
    </article>
  );
}

function formatCharacterClass(characterClassId: string | null) {
  if (!characterClassId) return "Custom origin";

  return characterClassId
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}
