import type { CharacterClass } from "../../types/characterClass.types";

export function CharacterClassPreview({
  characterClass,
  direction,
  onClick,
}: {
  characterClass: CharacterClass;
  direction: "previous" | "next";
  onClick: () => void;
}) {
  return (
    <button
      aria-label={`Preview ${characterClass.name}, ${direction} class`}
      className="carousel-side-card group relative col-span-1 hidden aspect-class-card overflow-hidden border-border bg-surface p-0 opacity-55 transition duration-300 hover:border-moon hover:scale-[1.03] hover:opacity-85 focus-visible:opacity-100 sm:block"
      onClick={onClick}
      type="button"
    >
      <img
        alt=""
        className="size-full object-cover grayscale transition duration-300 group-hover:grayscale-0"
        src={characterClass.imageUrl}
      />
      <span
        aria-hidden="true"
        className="absolute inset-0 bg-background/25 group-hover:bg-transparent"
      />
    </button>
  );
}
