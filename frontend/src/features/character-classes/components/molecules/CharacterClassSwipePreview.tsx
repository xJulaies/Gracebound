import type { CharacterClass } from "../../types/characterClass.types";

export function CharacterClassSwipePreview({
  characterClass,
}: {
  characterClass: CharacterClass;
}) {
  return (
    <article
      aria-hidden="true"
      className="carousel-swipe-preview absolute inset-y-0 left-0 z-20 m-0 w-full overflow-hidden rounded-panel border border-accent bg-surface-elevated p-0 sm:hidden"
    >
      <div className="relative size-full overflow-hidden">
        <img alt="" className="size-full object-cover" src={characterClass.imageUrl} />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-linear-to-t from-background via-background/15 to-transparent"
        />
        <div className="absolute inset-x-0 bottom-0 p-4 text-center">
          <p className="mb-1 text-sm text-accent uppercase tracking-widest">
            Starting level {characterClass.level}
          </p>
          <p className="mb-0 font-heading text-3xl">{characterClass.name}</p>
        </div>
      </div>
    </article>
  );
}
