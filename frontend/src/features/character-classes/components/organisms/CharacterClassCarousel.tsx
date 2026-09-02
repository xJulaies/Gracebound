import type { ReactNode } from "react";
import { useCharacterClassesQuery } from "../../hooks/useCharacterClassesQuery";
import { useCharacterClassCarousel } from "../../hooks/useCharacterClassCarousel";
import type { CharacterClass } from "../../types/characterClass.types";
import { CarouselArrowButton } from "../atoms/CarouselArrowButton";
import { CharacterClassCard } from "../molecules/CharacterClassCard";
import { CharacterClassPreview } from "../molecules/CharacterClassPreview";
import { CharacterClassSwipePreview } from "../molecules/CharacterClassSwipePreview";

export function CharacterClassCarousel() {
  const classesQuery = useCharacterClassesQuery();

  if (classesQuery.isPending) {
    return <CarouselSection><p>Loading character classes…</p></CarouselSection>;
  }
  if (classesQuery.isError) {
    return (
      <CarouselSection>
        <p role="alert">Character classes are currently unavailable.</p>
      </CarouselSection>
    );
  }
  const classes = classesQuery.data.data;
  if (classes.length === 0) {
    return <CarouselSection><p>No character classes found.</p></CarouselSection>;
  }

  return <LoadedCarousel classes={classes} />;
}

function LoadedCarousel({ classes }: { classes: CharacterClass[] }) {
  const carousel = useCharacterClassCarousel(classes);

  return (
    <CarouselSection>
      <div className="mb-5 text-center">
        <p className="eyebrow">Build creation experiment</p>
        <h2 id="character-class-carousel-heading">Choose your character</h2>
        <p className="text-foreground-muted">
          Browse the ten starting classes. Confirmation does not save a build yet.
        </p>
      </div>

      <div
        aria-label="Character class selection"
        aria-roledescription="carousel"
        className="carousel-stage relative grid touch-pan-y grid-cols-1 items-center gap-2 overflow-hidden sm:grid-cols-5 sm:gap-4 sm:overflow-visible"
        data-direction={carousel.direction}
        data-dragging={carousel.dragOffset !== 0}
        onKeyDown={carousel.handleKeyDown}
        onTouchCancel={carousel.resetDrag}
        onTouchEnd={carousel.handleTouchEnd}
        onTouchMove={carousel.handleTouchMove}
        onTouchStart={carousel.handleTouchStart}
        role="group"
        style={carousel.swipeStyle}
        tabIndex={0}
      >
        <CharacterClassPreview
          characterClass={carousel.previousClass}
          direction="previous"
          key={carousel.previousClass.id}
          onClick={carousel.showPrevious}
        />

        <CharacterClassCard
          activeIndex={carousel.activeIndex}
          characterClass={carousel.activeClass}
          classCount={classes.length}
          key={carousel.activeClass.id}
          onChoose={carousel.selectActiveClass}
        />

        {carousel.dragOffset !== 0 && (
          <CharacterClassSwipePreview characterClass={carousel.previewClass} />
        )}

        <CharacterClassPreview
          characterClass={carousel.nextClass}
          direction="next"
          key={carousel.nextClass.id}
          onClick={carousel.showNext}
        />
      </div>

      <div className="mt-4 flex justify-center gap-3">
        <CarouselArrowButton direction="previous" onClick={carousel.showPrevious} />
        <CarouselArrowButton direction="next" onClick={carousel.showNext} />
      </div>

      {carousel.selectedClass && (
        <p className="success mt-4 text-center" role="status">
          {carousel.selectedClass.name} selected for the experiment.
        </p>
      )}
    </CarouselSection>
  );
}

function CarouselSection({ children }: { children: ReactNode }) {
  return (
    <section aria-label="Character class carousel experiment">
      {children}
    </section>
  );
}
