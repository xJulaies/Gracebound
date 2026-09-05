import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import type { EquippedWeapon } from "../../types/editor.types";
import { WeaponInspector } from "./WeaponInspector";

vi.mock("../molecules/AshOfWarField", () => ({
  AshOfWarField: () => <div>Ash of War field</div>,
}));

const configuration: EquippedWeapon = {
  weapon: {
    id: "longsword",
    name: "Longsword",
    summary: null,
    description: null,
    categoryId: 1,
    weaponTypeId: 1,
    weaponType: "straight-sword",
    weight: 3.5,
    iconId: 100,
    iconUrl: "http://localhost:3000/api/assets/icons/100",
    swordArtId: 10,
    canChangeAffinity: true,
    castingTypes: [],
    requirements: { strength: 10, dexterity: 10, intelligence: 0, faith: 0, arcane: 0 },
    statusBuildup: null,
    variants: [
      { id: "longsword", affinity: "standard", maxUpgradeLevel: 25 },
      { id: "heavy-longsword", affinity: "heavy", maxUpgradeLevel: 25 },
    ],
    attacks: [],
    skills: [],
    gameVersion: "1.17.0",
  },
  variantId: "longsword",
  upgradeLevel: 0,
  ashOfWarId: null,
  ashOfWar: null,
};

describe("WeaponInspector", () => {
  it("identifies the edited weapon and updates its configuration", async () => {
    const onChange = vi.fn();
    const onClose = vi.fn();
    const user = userEvent.setup();

    render(
      <WeaponInspector
        configuration={configuration}
        onChange={onChange}
        onChangeWeapon={vi.fn()}
        onClose={onClose}
        onRemove={vi.fn()}
        slotLabel="Right hand 1"
      />,
    );

    expect(screen.getByRole("heading", { name: "Standard Longsword +0" }))
      .toBeInTheDocument();
    expect(screen.getByText("Editing · Right hand 1")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Heavy" }));
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({
      variantId: "heavy-longsword",
      ashOfWarId: null,
    }));

    await user.click(screen.getByRole("button", { name: "Increase upgrade level" }));
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ upgradeLevel: 1 }));

    fireEvent.click(
      screen.getByRole("button", { name: "Increase upgrade level" }),
      { shiftKey: true },
    );
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ upgradeLevel: 5 }));

    await user.click(screen.getByRole("button", { name: "Set changes" }));
    expect(onClose).toHaveBeenCalledOnce();
  });
});
