import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { useCharacterClassesQuery } from "../../hooks/useCharacterClassesQuery";
import type { CharacterClass } from "../../types/characterClass.types";
import {
  CharacterClassCarousel,
} from "./CharacterClassCarousel";
import { getHighlightedStats } from "../../domain/getHighlightedStats";

vi.mock("../../hooks/useCharacterClassesQuery", () => ({
  useCharacterClassesQuery: vi.fn(),
}));

const classes = [
  characterClass("vagabond", "Vagabond", 9, 15, 14),
  characterClass("warrior", "Warrior", 8, 11, 10),
  characterClass("wretch", "Wretch", 1, 10, 10),
];

describe("CharacterClassCarousel", () => {
  it("previews neighboring classes and confirms separately", async () => {
    vi.mocked(useCharacterClassesQuery).mockReturnValue({
      isPending: false,
      isError: false,
      data: { status: 200, message: "Classes found", data: classes },
    } as ReturnType<typeof useCharacterClassesQuery>);
    const user = userEvent.setup();
    render(<CharacterClassCarousel />);

    expect(screen.getByRole("heading", { name: "Vagabond" })).toBeInTheDocument();
    await user.click(screen.getByRole("button", {
      name: "Preview Warrior, next class",
    }));
    expect(screen.getByRole("heading", { name: "Warrior" })).toBeInTheDocument();
    expect(screen.queryByRole("status")).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Choose Warrior" }));
    expect(screen.getByRole("status")).toHaveTextContent("Warrior selected");
  });

  it("supports keyboard navigation", async () => {
    vi.mocked(useCharacterClassesQuery).mockReturnValue({
      isPending: false,
      isError: false,
      data: { status: 200, message: "Classes found", data: classes },
    } as ReturnType<typeof useCharacterClassesQuery>);
    const user = userEvent.setup();
    render(<CharacterClassCarousel />);

    const carousel = screen.getByRole("group", {
      name: "Character class selection",
    });
    carousel.focus();
    await user.keyboard("{ArrowRight}");

    expect(screen.getByRole("heading", { name: "Warrior" })).toBeInTheDocument();
  });

  it("supports repeated navigation in the same direction", async () => {
    vi.mocked(useCharacterClassesQuery).mockReturnValue({
      isPending: false,
      isError: false,
      data: { status: 200, message: "Classes found", data: classes },
    } as ReturnType<typeof useCharacterClassesQuery>);
    const user = userEvent.setup();
    render(<CharacterClassCarousel />);

    await user.click(screen.getByRole("button", { name: "Next class" }));
    expect(screen.getByRole("heading", { name: "Warrior" })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Next class" }));
    expect(screen.getByRole("heading", { name: "Wretch" })).toBeInTheDocument();
  });

  it("previews and selects the next class while swiping left", () => {
    vi.mocked(useCharacterClassesQuery).mockReturnValue({
      isPending: false,
      isError: false,
      data: { status: 200, message: "Classes found", data: classes },
    } as ReturnType<typeof useCharacterClassesQuery>);
    const { container } = render(<CharacterClassCarousel />);
    const carousel = screen.getByRole("group", {
      name: "Character class selection",
    });
    Object.defineProperty(carousel, "clientWidth", { value: 300 });

    fireEvent.touchStart(carousel, { touches: [{ clientX: 250 }] });
    fireEvent.touchMove(carousel, { touches: [{ clientX: 100 }] });

    expect(container.querySelector(".carousel-swipe-preview")).toHaveTextContent(
      "Warrior",
    );
    expect(carousel).toHaveAttribute("data-dragging", "true");

    fireEvent.touchEnd(carousel, { changedTouches: [{ clientX: 100 }] });

    expect(screen.getByRole("heading", { name: "Warrior" })).toBeInTheDocument();
    expect(container.querySelector(".carousel-swipe-preview")).not.toBeInTheDocument();
  });

  it("highlights the three strongest stats deterministically", () => {
    expect(getHighlightedStats(classes[0]!.stats)).toEqual([
      "vigor",
      "strength",
      "dexterity",
    ]);
  });
});

function characterClass(
  id: string,
  name: string,
  level: number,
  vigor: number,
  strength: number,
): CharacterClass {
  return {
    id,
    name,
    imageUrl: `http://localhost:3000/api/assets/character-classes/${id}`,
    level,
    stats: {
      vigor,
      mind: 10,
      endurance: 11,
      strength,
      dexterity: 13,
      intelligence: 9,
      faith: 9,
      arcane: 7,
    },
    gameVersion: "1.17.0",
  };
}
