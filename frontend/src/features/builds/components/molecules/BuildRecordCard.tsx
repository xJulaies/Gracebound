import type { Build } from "../../types/build.types";
import { getBuildStatHighlights } from "../../domain/getBuildStatHighlights";
import { BuildStat } from "../atoms/BuildStat";
import { Link } from "@tanstack/react-router";

export function BuildRecordCard({
  build,
  isDeleting,
  isDuplicating,
  onDelete,
  onDuplicate,
}: {
  build: Build;
  isDeleting: boolean;
  isDuplicating: boolean;
  onDelete: () => void;
  onDuplicate: () => void;
}) {
  return (
    <article className="build-record-card">
      <header className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="mb-1 text-xs uppercase tracking-widest text-foreground-muted">
            Level {build.level} · {formatCharacterClass(build.characterClassId)}
          </p>
          <h2 className="mb-2 truncate text-xl">{build.name}</h2>
        </div>
        <span className="build-record-visibility" data-visibility={build.visibility}>
          {build.visibility}
        </span>
      </header>
      <p className="mb-4 line-clamp-3 min-h-12 text-sm leading-6 text-foreground-muted">
        {build.description || "No record notes have been added."}
      </p>
      <dl className="mb-5 grid grid-cols-3 gap-2">
        {getBuildStatHighlights(build.stats).map((stat) => (
          <BuildStat key={stat.label} {...stat} />
        ))}
      </dl>
      <p className="mb-4 border-t border-border pt-3 text-xs text-foreground-muted">
        Last recorded {formatDate(build.updatedAt)} · Game {build.gameVersion}
      </p>
      <footer className="flex flex-wrap justify-end gap-2">
        <Link
          className="build-primary-action"
          params={{ buildId: build.id }}
          to="/my-builds/$buildId/edit"
        >
          Edit
        </Link>
        <button
          className="build-secondary-action"
          disabled={isDeleting || isDuplicating}
          onClick={onDuplicate}
          type="button"
        >
          {isDuplicating ? "Copying…" : "Duplicate"}
        </button>
        <button
          className="build-danger-action"
          disabled={isDeleting || isDuplicating}
          onClick={onDelete}
          type="button"
        >
          Delete
        </button>
      </footer>
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

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}
