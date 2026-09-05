import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { useWeaponsQuery } from "../../../weapons/hooks/useWeaponsQuery";
import type { Weapon } from "../../../weapons/types/weapon.types";
import { WeaponPicker } from "./WeaponPicker";

vi.mock("../../../weapons/hooks/useWeaponsQuery", () => ({
  useWeaponsQuery: vi.fn(),
}));

const longsword: Weapon = {
  id: "longsword",
  name: "Longsword",
  summary: null,
  description: "A dependable straight sword.",
  categoryId: 1,
  weaponTypeId: 1,
  weaponType: "Straight Sword",
  weight: 3.5,
  iconId: 100,
  iconUrl: "http://localhost:3000/api/assets/icons/100",
  swordArtId: 10,
  canChangeAffinity: false,
  castingTypes: [],
  requirements: { strength: 10, dexterity: 10, intelligence: 0, faith: 0, arcane: 0 },
  statusBuildup: { poison: 0, rot: 0, bleed: 45, frost: 0, sleep: 0, madness: 0, deathBlight: 0 },
  variants: [{ id: "longsword", affinity: "standard", maxUpgradeLevel: 25 }],
  attacks: [],
  skills: [{
    id: "square-off",
    name: "Square Off",
    summary: null,
    description: "This skill starts with the sword held level.",
    attacks: [],
  }],
  gameVersion: "1.17.0",
};

describe("WeaponPicker", () => {
  it("shows weapons and returns the selected weapon", async () => {
    vi.mocked(useWeaponsQuery).mockReturnValue({
      isPending: false,
      isError: false,
      data: { status: 200, message: "Weapons found", data: [longsword] },
    } as ReturnType<typeof useWeaponsQuery>);
    const onSelect = vi.fn();
    const user = userEvent.setup();

    render(
      <WeaponPicker
        onClose={vi.fn()}
        onSelect={onSelect}
        slotLabel="Right hand 1"
      />,
    );

    expect(screen.getByRole("dialog")).toHaveTextContent("For Right hand 1");
    await user.click(screen.getByRole("button", { name: /Longsword/ }));
    expect(onSelect).toHaveBeenCalledWith(longsword);
  });

  it("closes with Escape", async () => {
    vi.mocked(useWeaponsQuery).mockReturnValue({
      isPending: true,
      isError: false,
    } as ReturnType<typeof useWeaponsQuery>);
    const onClose = vi.fn();
    const user = userEvent.setup();

    render(
      <WeaponPicker
        onClose={onClose}
        onSelect={vi.fn()}
        slotLabel="Left hand 1"
      />,
    );

    await user.keyboard("{Escape}");
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("previews weapon details without selecting the weapon", async () => {
    vi.mocked(useWeaponsQuery).mockReturnValue({
      isPending: false,
      isError: false,
      data: { status: 200, message: "Weapons found", data: [longsword] },
    } as ReturnType<typeof useWeaponsQuery>);
    const onSelect = vi.fn();
    const user = userEvent.setup();

    render(
      <WeaponPicker
        onClose={vi.fn()}
        onSelect={onSelect}
        slotLabel="Right hand 1"
      />,
    );

    await user.click(screen.getByRole("button", { name: "Details" }));

    expect(
      screen.getByRole("complementary", { name: "Longsword details" }),
    ).toHaveTextContent("A dependable straight sword.");
    expect(screen.getByText("Maximum upgrade")).toBeInTheDocument();
    expect(screen.getByText("Required attributes")).toBeInTheDocument();
    expect(screen.getByText("Strength")).toBeInTheDocument();
    expect(screen.getByText("Status buildup")).toBeInTheDocument();
    expect(screen.getByText("Bleed")).toBeInTheDocument();
    expect(screen.queryByText("Available affinities")).not.toBeInTheDocument();
    expect(screen.getByText("Unique skill")).toBeInTheDocument();
    expect(screen.getByText("This skill starts with the sword held level.")).toBeInTheDocument();
    expect(onSelect).not.toHaveBeenCalled();
  });
});
