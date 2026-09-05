import type { CharacterClass } from "../../types/characterClass.types";
import { CharacterStatsGrid } from "./CharacterStatsGrid";

export function CharacterClassCard({
  activeIndex,
  characterClass,
  classCount,
  onChoose,
}: {
  activeIndex: number;
  characterClass: CharacterClass;
  classCount: number;
  onChoose: () => void;
}) {
  return (
    <article
      className="carousel-focus-card relative z-10 col-span-1 m-0 overflow-hidden rounded-panel border border-accent bg-surface-elevated p-0 shadow-2xl shadow-background sm:col-span-3"
    >
      <span aria-live="polite" className="sr-only">
        Showing {characterClass.name}, class {activeIndex + 1} of {classCount}
      </span>
      <div className="relative aspect-class-card overflow-hidden">
        <img
          alt={`${characterClass.name} starting class`}
          className="size-full object-cover"
          src={characterClass.imageUrl}
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-linear-to-t from-background via-background/15 to-transparent"
        />
        <div className="absolute inset-x-0 bottom-0 p-4 text-center sm:p-6">
          <p className="mb-1 text-sm text-accent uppercase tracking-widest">
            Starting level {characterClass.level}
          </p>
          <h3 className="mb-0 text-3xl sm:text-4xl">{characterClass.name}</h3>
        </div>
      </div>

      <CharacterStatsGrid stats={characterClass.stats} />

      <div className="flex flex-col items-center gap-3 border-t border-border p-4">
        <button
          className="border-accent bg-accent px-6 text-background hover:border-accent-hover hover:bg-accent-hover"
          onClick={onChoose}
          type="button"
        >
          Choose {characterClass.name}
        </button>
        <span className="text-sm text-foreground-muted">
          {activeIndex + 1} / {classCount}
        </span>
      </div>
    </article>
  );
}
