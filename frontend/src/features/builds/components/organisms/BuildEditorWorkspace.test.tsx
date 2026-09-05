import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import type { CharacterClass } from "../../../character-classes/types/characterClass.types";
import type { Weapon } from "../../../weapons/types/weapon.types";
import type { GreatRune } from "../../../great-runes/types/greatRune.types";
import type { CrystalTear } from "../../../crystal-tears/types/crystalTear.types";
import { BuildEditorWorkspace } from "./BuildEditorWorkspace";

const { useBuildStatsPreviewQueryMock } = vi.hoisted(() => ({
  useBuildStatsPreviewQueryMock: vi.fn(),
}));

const vagabond: CharacterClass = {
  id: "vagabond",
  name: "Vagabond",
  imageUrl: "http://localhost:3000/api/assets/character-classes/vagabond",
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

vi.mock(
  "../../../character-classes/components/organisms/CharacterClassCarousel",
  () => ({
    CharacterClassCarousel: ({
      onSelect,
    }: {
      onSelect: (characterClass: CharacterClass) => void;
    }) => (
      <button onClick={() => onSelect(vagabond)} type="button">
        Choose Vagabond
      </button>
    ),
  }),
);

vi.mock("../../hooks/useBuildStatsPreviewQuery", () => ({
  useBuildStatsPreviewQuery: useBuildStatsPreviewQueryMock,
}));

useBuildStatsPreviewQueryMock.mockReturnValue({
  data: undefined,
  isError: false,
  isFetching: false,
  isPending: false,
});

vi.mock("./WeaponPicker", () => ({
  WeaponPicker: ({ onSelect }: { onSelect: (weapon: Weapon) => void }) => (
    <div>
      <p>Weapon picker open</p>
      <button
        onClick={() => onSelect({
          id: "longsword",
          name: "Longsword",
          summary: null,
          description: null,
          categoryId: 1,
          weaponTypeId: 1,
          weaponType: "straight-sword",
          weight: 3.5,
          iconId: 100,
          iconUrl: "/icon.webp",
          swordArtId: 10,
          canChangeAffinity: true,
          castingTypes: [],
          requirements: { strength: 10, dexterity: 10, intelligence: 0, faith: 0, arcane: 0 },
          statusBuildup: null,
          variants: [{ id: "longsword", affinity: "standard", maxUpgradeLevel: 25 }],
          attacks: [],
          skills: [],
          gameVersion: "1.17.0",
        })}
        type="button"
      >
        Select Longsword
      </button>
    </div>
  ),
}));

vi.mock("./WeaponInspector", () => ({
  WeaponInspector: () => <div>Weapon configuration</div>,
}));

vi.mock("./GreatRunePicker", () => ({
  GreatRunePicker: ({ onSelect }: { onSelect: (greatRune: GreatRune) => void }) => (
    <button
      onClick={() => onSelect({
        id: "godricks-great-rune",
        name: "Godrick's Great Rune",
        summary: null,
        description: null,
        iconId: 1,
        iconUrl: "/great-rune.webp",
        activation: "rune-arc",
        calculationStatus: "supported",
        effects: null,
        limitations: [],
        gameVersion: "1.17.0",
      })}
      type="button"
    >
      Select Godrick's Great Rune
    </button>
  ),
}));

vi.mock("./CrystalTearPicker", () => ({
  CrystalTearPicker: ({ onSelect }: { onSelect: (crystalTear: CrystalTear) => void }) => (
    <button
      onClick={() => onSelect({
        id: "strength-knot-crystal-tear",
        name: "Strength-knot Crystal Tear",
        summary: null,
        description: null,
        iconId: 2,
        iconUrl: "/crystal-tear.webp",
        calculationStatus: "supported",
        effects: null,
        limitations: [],
        gameVersion: "1.17.0",
      })}
      type="button"
    >
      Select Strength-knot Crystal Tear
    </button>
  ),
}));

vi.mock("./ArmorPicker", () => ({
  ArmorPicker: ({ onSelect }: { onSelect: (armor: unknown) => void }) => (
    <div>
      <p>Armor picker open</p>
      <button
        onClick={() => onSelect({
          id: "vagabond-knight-helm",
          name: "Vagabond Knight Helm",
          slot: "head",
          iconUrl: "/helm.webp",
          weight: 4,
          poise: 7,
        })}
        type="button"
      >
        Select Vagabond Knight Helm
      </button>
    </div>
  ),
}));

vi.mock("./TalismanPicker", () => ({
  TalismanPicker: ({ onSelect }: { onSelect: (talisman: unknown) => void }) => (
    <div>
      <p>Talisman picker open</p>
      <button
        onClick={() => onSelect({
          id: "axe-talisman",
          name: "Axe Talisman",
          iconUrl: "/axe-talisman.webp",
          weight: 0.8,
        })}
        type="button"
      >
        Select Axe Talisman
      </button>
    </div>
  ),
}));

describe("BuildEditorWorkspace", () => {
  it("replaces the class selector with the builder and can return", async () => {
    const user = userEvent.setup();
    render(<BuildEditorWorkspace />);

    await user.click(screen.getByRole("button", { name: "Choose Vagabond" }));

    expect(screen.queryByRole("button", { name: "Choose Vagabond" })).not.toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Vagabond" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Equipment" })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Change character" }));

    expect(screen.getByRole("button", { name: "Choose Vagabond" })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Equipment" })).not.toBeInTheDocument();
  });

  it("edits attributes from the class minimum in single and five-level steps", async () => {
    const user = userEvent.setup();
    render(<BuildEditorWorkspace />);

    await user.click(screen.getByRole("button", { name: "Choose Vagabond" }));
    const vigor = screen.getByRole("spinbutton", { name: "Vigor" });

    expect(vigor).toHaveValue(15);
    expect(screen.getByRole("button", { name: "Decrease Vigor" })).toBeDisabled();
    await user.click(screen.getByRole("button", { name: "Increase Vigor" }));
    expect(vigor).toHaveValue(16);
    await user.keyboard("{Shift>}");
    await user.click(screen.getByRole("button", { name: "Increase Vigor" }));
    await user.keyboard("{/Shift}");
    expect(vigor).toHaveValue(21);
    expect(screen.getByText("Level 15")).toBeInTheDocument();
  });

  it("switches between the three compact editor tabs", async () => {
    const user = userEvent.setup();
    render(<BuildEditorWorkspace />);

    await user.click(screen.getByRole("button", { name: "Choose Vagabond" }));

    expect(screen.getByRole("tab", { name: "Equipment" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    await user.click(screen.getByRole("tab", { name: "Leveling" }));
    expect(screen.getByRole("tab", { name: "Leveling" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    await user.click(screen.getByRole("tab", { name: "Status" }));
    expect(screen.getByRole("tab", { name: "Status" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
  });

  it("supports the complete keyboard pattern for compact editor tabs", async () => {
    const user = userEvent.setup();
    render(<BuildEditorWorkspace />);

    await user.click(screen.getByRole("button", { name: "Choose Vagabond" }));
    const equipment = screen.getByRole("tab", { name: "Equipment" });
    const status = screen.getByRole("tab", { name: "Status" });
    const leveling = screen.getByRole("tab", { name: "Leveling" });

    expect(equipment).toHaveAttribute("tabindex", "0");
    expect(leveling).toHaveAttribute("tabindex", "-1");
    equipment.focus();
    await user.keyboard("{ArrowRight}");
    expect(status).toHaveFocus();
    expect(status).toHaveAttribute("aria-selected", "true");
    await user.keyboard("{ArrowRight}");
    expect(leveling).toHaveFocus();
    await user.keyboard("{End}");
    expect(status).toHaveFocus();
    await user.keyboard("{Home}");
    expect(leveling).toHaveFocus();
    await user.keyboard("{ArrowLeft}");
    expect(status).toHaveFocus();
  });

  it("opens the weapon picker again when an occupied slot is clicked", async () => {
    const user = userEvent.setup();
    render(<BuildEditorWorkspace />);

    await user.click(screen.getByRole("button", { name: "Choose Vagabond" }));
    await user.click(screen.getByRole("button", {
      name: "Right hand 1: Empty. Select item",
    }));
    await user.click(screen.getByRole("button", { name: "Select Longsword" }));

    expect(screen.queryByText("Weapon picker open")).not.toBeInTheDocument();
    expect(screen.getAllByText("Standard Longsword +0")).toHaveLength(2);
    await user.click(screen.getByRole("button", {
      name: "Right hand 1: Standard Longsword +0. Change selection",
    }));

    expect(screen.getByText("Weapon picker open")).toBeInTheDocument();
  });

  it("selects and replaces armor through its matching slot", async () => {
    const user = userEvent.setup();
    render(<BuildEditorWorkspace />);

    await user.click(screen.getByRole("button", { name: "Choose Vagabond" }));
    await user.click(screen.getByRole("button", { name: "Head: Empty. Select item" }));
    await user.click(screen.getByRole("button", { name: "Select Vagabond Knight Helm" }));

    const occupiedSlot = screen.getByRole("button", {
      name: "Head: Vagabond Knight Helm. Change selection",
    });
    expect(occupiedSlot).toBeInTheDocument();
    await user.click(occupiedSlot);
    expect(screen.getByText("Armor picker open")).toBeInTheDocument();
  });

  it("selects and replaces a talisman through its matching slot", async () => {
    const user = userEvent.setup();
    render(<BuildEditorWorkspace />);

    await user.click(screen.getByRole("button", { name: "Choose Vagabond" }));
    await user.click(screen.getByRole("button", {
      name: "Talisman 1: Empty. Select item",
    }));
    await user.click(screen.getByRole("button", { name: "Select Axe Talisman" }));

    const occupiedSlot = screen.getByRole("button", {
      name: "Talisman 1: Axe Talisman. Change selection",
    });
    expect(occupiedSlot).toBeInTheDocument();
    await user.click(occupiedSlot);
    expect(screen.getByText("Talisman picker open")).toBeInTheDocument();
  });

  it("includes equipped weapons, armor, and talismans in the stats preview", async () => {
    const user = userEvent.setup();
    useBuildStatsPreviewQueryMock.mockClear();
    render(<BuildEditorWorkspace />);

    await user.click(screen.getByRole("button", { name: "Choose Vagabond" }));
    await user.click(screen.getByRole("button", {
      name: "Right hand 1: Empty. Select item",
    }));
    await user.click(screen.getByRole("button", { name: "Select Longsword" }));
    await user.click(screen.getByRole("button", { name: "Head: Empty. Select item" }));
    await user.click(screen.getByRole("button", { name: "Select Vagabond Knight Helm" }));
    await user.click(screen.getByRole("button", {
      name: "Talisman 1: Empty. Select item",
    }));
    await user.click(screen.getByRole("button", { name: "Select Axe Talisman" }));

    await waitFor(() => expect(useBuildStatsPreviewQueryMock).toHaveBeenLastCalledWith(
      expect.objectContaining({
        armorIds: ["vagabond-knight-helm"],
        talismanIds: ["axe-talisman"],
        weaponIds: ["longsword"],
      }),
    ));
  });

  it("equips a Great Rune and Crystal Tear and includes them in the stats preview", async () => {
    const user = userEvent.setup();
    useBuildStatsPreviewQueryMock.mockClear();
    render(<BuildEditorWorkspace />);

    await user.click(screen.getByRole("button", { name: "Choose Vagabond" }));
    await user.click(screen.getByRole("button", { name: "Great Rune: Empty. Select item" }));
    await user.click(screen.getByRole("button", { name: "Select Godrick's Great Rune" }));
    await user.click(screen.getByRole("button", { name: "Crystal Tear 1: Empty. Select item" }));
    await user.click(screen.getByRole("button", { name: "Select Strength-knot Crystal Tear" }));

    expect(screen.getByRole("button", {
      name: "Great Rune: Godrick's Great Rune. Change selection",
    })).toBeInTheDocument();
    expect(screen.getByRole("button", {
      name: "Crystal Tear 1: Strength-knot Crystal Tear. Change selection",
    })).toBeInTheDocument();
    await waitFor(() => expect(useBuildStatsPreviewQueryMock).toHaveBeenLastCalledWith(
      expect.objectContaining({
        greatRuneId: "godricks-great-rune",
        crystalTearIds: ["strength-knot-crystal-tear"],
      }),
    ));
  });
});
