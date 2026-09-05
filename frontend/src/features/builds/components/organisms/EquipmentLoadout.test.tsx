import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { EquipmentLoadout } from "./EquipmentLoadout";

describe("EquipmentLoadout", () => {
  it("renders all equipment, Great Rune, and Wondrous Physick slots", () => {
    render(<EquipmentLoadout />);

    expect(screen.getAllByRole("button")).toHaveLength(17);
    expect(screen.getByRole("group", { name: "Left hand" })).toBeInTheDocument();
    expect(screen.getByRole("group", { name: "Armor" })).toBeInTheDocument();
    expect(screen.getByRole("group", { name: "Talismans" })).toBeInTheDocument();
    expect(screen.getByRole("group", { name: "Right hand" })).toBeInTheDocument();
    expect(screen.getByRole("group", { name: "Great Rune" })).toBeInTheDocument();
    expect(screen.getByRole("group", { name: "Wondrous Physick" })).toBeInTheDocument();
  });
});
