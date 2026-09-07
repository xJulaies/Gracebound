import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { EquipmentLoadout } from "./EquipmentLoadout";

describe("EquipmentLoadout", () => {
  it("renders all equipment, Great Rune, Wondrous Physick, and spell slots", () => {
    render(<EquipmentLoadout availableSpellSlots={12} />);

    expect(screen.getAllByRole("button")).toHaveLength(29);
    expect(screen.getByRole("group", { name: "Left hand" })).toBeInTheDocument();
    expect(screen.getByRole("group", { name: "Armor" })).toBeInTheDocument();
    expect(screen.getByRole("group", { name: "Talismans" })).toBeInTheDocument();
    expect(screen.getByRole("group", { name: "Right hand" })).toBeInTheDocument();
    expect(screen.getByRole("group", { name: "Great Rune" })).toBeInTheDocument();
    expect(screen.getByRole("group", { name: "Wondrous Physick" })).toBeInTheDocument();
    expect(screen.getByRole("group", { name: "Spells" })).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: /^Spell slot \d+: Empty\. Select spell$/ })).toHaveLength(12);
    expect(
      screen.getByRole("group", { name: "Spells" }).querySelector('[data-slot-layout="compact"]'),
    ).toHaveClass("grid-cols-3");
  });
});
