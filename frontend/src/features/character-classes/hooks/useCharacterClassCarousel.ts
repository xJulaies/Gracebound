import {
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type TouchEvent,
} from "react";
import { wrapCarouselIndex } from "../domain/wrapCarouselIndex";
import type { CharacterClass } from "../types/characterClass.types";

const DEFAULT_ROOT_FONT_SIZE = 16;

export function useCharacterClassCarousel(classes: CharacterClass[]) {
  const initialClass = classes.find(({ id }) => id === "vagabond") ?? classes[0]!;
  const [activeClassId, setActiveClassId] = useState(initialClass.id);
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
  const [direction, setDirection] = useState<"previous" | "next">("next");
  const [dragOffset, setDragOffset] = useState(0);
  const [carouselWidth, setCarouselWidth] = useState(1);
  const touchStartX = useRef<number | null>(null);
  const activeIndex = Math.max(
    0,
    classes.findIndex(({ id }) => id === activeClassId),
  );
  const activeClass = classes[activeIndex]!;
  const previousClass = classes[
    wrapCarouselIndex(activeIndex - 1, classes.length)
  ]!;
  const nextClass = classes[
    wrapCarouselIndex(activeIndex + 1, classes.length)
  ]!;
  const dragDirection = dragOffset < 0 ? "next" : "previous";
  const previewClass = dragDirection === "next" ? nextClass : previousClass;
  const dragProgress = Math.min(Math.abs(dragOffset) / carouselWidth, 1);
  const rootFontSize = getRootFontSize();
  const swipeStyle = {
    "--swipe-offset": toRem(dragOffset, rootFontSize),
    "--swipe-scale": 1 - dragProgress * 0.12,
    "--preview-offset": toRem(
      (dragDirection === "next" ? carouselWidth : -carouselWidth) + dragOffset,
      rootFontSize,
    ),
    "--preview-scale": 0.88 + dragProgress * 0.12,
  } as CSSProperties;

  function showPrevious() {
    setDirection("previous");
    setActiveClassId(previousClass.id);
  }

  function showNext() {
    setDirection("next");
    setActiveClassId(nextClass.id);
  }

  function selectActiveClass() {
    setSelectedClassId(activeClass.id);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLElement>) {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      showPrevious();
    }
    if (event.key === "ArrowRight") {
      event.preventDefault();
      showNext();
    }
  }

  function handleTouchStart(event: TouchEvent<HTMLElement>) {
    touchStartX.current = event.touches[0]?.clientX ?? null;
    setCarouselWidth(event.currentTarget.clientWidth || 1);
    setDragOffset(0);
  }

  function handleTouchMove(event: TouchEvent<HTMLElement>) {
    if (touchStartX.current === null) return;
    const currentX = event.touches[0]?.clientX;
    if (currentX === undefined) return;
    const width = event.currentTarget.clientWidth || 1;
    const distance = currentX - touchStartX.current;
    setDragOffset(Math.max(-width, Math.min(width, distance)));
  }

  function handleTouchEnd(event: TouchEvent<HTMLElement>) {
    if (touchStartX.current === null) return;
    const endX = event.changedTouches[0]?.clientX;
    if (endX === undefined) {
      resetDrag();
      return;
    }
    const distance = endX - touchStartX.current;
    const threshold = (event.currentTarget.clientWidth || 1) * 0.25;
    if (Math.abs(distance) >= threshold) {
      if (distance > 0) showPrevious();
      else showNext();
    }
    resetDrag();
  }

  function resetDrag() {
    touchStartX.current = null;
    setDragOffset(0);
  }

  return {
    activeClass,
    activeIndex,
    direction,
    dragOffset,
    handleKeyDown,
    handleTouchEnd,
    handleTouchMove,
    handleTouchStart,
    nextClass,
    previewClass,
    previousClass,
    resetDrag,
    selectActiveClass,
    selectedClass: classes.find(({ id }) => id === selectedClassId) ?? null,
    showNext,
    showPrevious,
    swipeStyle,
  };
}

function getRootFontSize() {
  if (typeof window === "undefined") return DEFAULT_ROOT_FONT_SIZE;

  const rootFontSize = Number.parseFloat(
    window.getComputedStyle(document.documentElement).fontSize,
  );
  return rootFontSize || DEFAULT_ROOT_FONT_SIZE;
}

function toRem(value: number, rootFontSize: number) {
  return `${value / rootFontSize}rem`;
}
