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

  it("marks the active slot without adding an overlapping badge", () => {
    render(
      <EquipmentSlot
        emptyAssetId="right-weapon-slot"
        id="right-hand-1"
        isActive
        item={{ name: "Longsword", iconUrl: "/icon.webp" }}
        label="Right hand 1"
      />,
    );

    const slot = screen.getByRole("button");
    expect(screen.queryByText("Editing")).not.toBeInTheDocument();
    expect(slot).toHaveAttribute("aria-current", "true");
    expect(slot).toHaveClass("border-accent");
  });

  it("exposes a reusable slot status badge in its accessible name", () => {
    render(
      <EquipmentSlot
        emptyAssetId="left-weapon-slot"
        id="left-hand-1"
        item={{ name: "Academy Glintstone Staff", iconUrl: "/staff.webp" }}
        label="Left hand 1"
        occupiedActionLabel="Select armament"
        statusBadge="Catalyst"
      />,
    );

    expect(screen.getByRole("button", {
      name: "Left hand 1: Academy Glintstone Staff. Select armament. Catalyst active",
    })).toBeInTheDocument();
  });

  it("shows and hides the portalled preview from the shared slot interaction", () => {
    render(
      <EquipmentSlot
        emptyAssetId="crystal-tear-category"
        id="crystal-tear-1"
        item={{ name: "Flame-Shrouding Cracked Tear", iconUrl: "/tear.webp" }}
        label="Crystal Tear 1"
      />,
    );

    const slot = screen.getByRole("button");
    expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
    fireEvent.mouseEnter(slot);
    expect(screen.getByRole("tooltip")).toBeInTheDocument();
    expect(slot).toHaveAttribute("aria-describedby", screen.getByRole("tooltip").id);
    fireEvent.mouseLeave(slot);
    expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
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
