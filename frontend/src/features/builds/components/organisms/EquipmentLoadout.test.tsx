import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { EquipmentLoadout } from "./EquipmentLoadout";

describe("EquipmentLoadout", () => {
  it("renders all planned weapon, armor, and talisman slots", () => {
    render(<EquipmentLoadout />);

    expect(screen.getAllByRole("button")).toHaveLength(14);
    expect(screen.getByRole("group", { name: "Left hand" })).toBeInTheDocument();
    expect(screen.getByRole("group", { name: "Armor" })).toBeInTheDocument();
    expect(screen.getByRole("group", { name: "Talismans" })).toBeInTheDocument();
    expect(screen.getByRole("group", { name: "Right hand" })).toBeInTheDocument();
  });
});
