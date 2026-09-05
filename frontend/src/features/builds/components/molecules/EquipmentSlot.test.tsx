import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { EquipmentSlot } from "./EquipmentSlot";

describe("EquipmentSlot", () => {
  it("labels and selects an empty slot accessibly", () => {
    const onSelect = vi.fn();
    render(
      <EquipmentSlot
        emptyAssetId="right-weapon-slot"
        id="right-hand-1"
        label="Right hand 1"
        onSelect={onSelect}
      />,
    );

    fireEvent.click(screen.getByRole("button", {
      name: "Right hand 1: Empty. Select item",
    }));
    expect(onSelect).toHaveBeenCalledWith("right-hand-1");
  });

  it("shows the selected item and offers changing it", () => {
    render(
      <EquipmentSlot
        emptyAssetId="talisman-slot"
        id="talisman-1"
        item={{ name: "Axe Talisman", iconUrl: "/icon.webp" }}
        label="Talisman 1"
      />,
    );

    expect(screen.getByRole("button", {
      name: "Talisman 1: Axe Talisman. Change selection",
    })).toBeInTheDocument();
    expect(screen.getByText("Axe Talisman")).toBeInTheDocument();
  });

  it("visibly marks the slot currently being edited", () => {
    render(
      <EquipmentSlot
        emptyAssetId="right-weapon-slot"
        id="right-hand-1"
        isActive
        item={{ name: "Longsword", iconUrl: "/icon.webp" }}
        label="Right hand 1"
      />,
    );

    expect(screen.getByText("Editing")).toBeInTheDocument();
    expect(screen.getByRole("button")).toHaveAttribute("aria-current", "true");
  });

  it("shows an Ash icon over the weapon and keeps the complete upgraded name", () => {
    const { container } = render(
      <EquipmentSlot
        emptyAssetId="right-weapon-slot"
        id="right-hand-1"
        item={{
          name: "Heavy Banished Knight's Greatsword +25",
          iconUrl: "/weapon.webp",
          secondaryIconUrl: "/ash.webp",
        }}
        label="Right hand 1"
      />,
    );

    expect(screen.getByText("Heavy Banished Knight's Greatsword +25"))
      .toBeInTheDocument();
    expect(container.querySelector('img[src="/ash.webp"]')).toBeInTheDocument();
  });
});
