import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { CharacterClass } from "../../../character-classes/types/characterClass.types";
import { CharacterAttributePanel } from "./CharacterAttributePanel";

const vagabond: CharacterClass = {
  id: "vagabond",
  name: "Vagabond",
  imageUrl: "/vagabond.webp",
  level: 9,
  stats: {
    vigor: 15,
    mind: 10,
    endurance: 11,
    strength: 14,
    dexterity: 13,
    intelligence: 9,
    faith: 9,
    arcane: 7,
  },
  gameVersion: "1.17.0",
};

describe("CharacterAttributePanel", () => {
  it("shows invested levels and backend-provided rune costs", () => {
    render(
      <CharacterAttributePanel
        characterClass={vagabond}
        characterLevel={15}
        isUpdatingCosts={false}
        nextLevelRuneCost={1_659}
        onChangeAttribute={vi.fn()}
        onChangeCharacter={vi.fn()}
        stats={{ ...vagabond.stats, vigor: 21 }}
        totalRuneCost={6_208}
      />,
    );

    expect(screen.getByText("Invested levels").nextSibling).toHaveTextContent("6");
    expect(screen.getByText("Next level").nextSibling).toHaveTextContent("1,659");
    expect(screen.getByText("Total invested").nextSibling).toHaveTextContent("6,208");
  });
});
