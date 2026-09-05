import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { expectNoAccessibilityViolations } from "../../../../test/accessibility";
import { EquipmentCatalogHeader } from "./EquipmentCatalogHeader";

describe("EquipmentCatalogHeader", () => {
  it("exposes category and search changes to the route owner", async () => {
    const user = userEvent.setup();
    const onCategoryChange = vi.fn();
    const onSearchChange = vi.fn();
    render(
      <EquipmentCatalogHeader
        filters={{ category: "all", search: "" }}
        onCategoryChange={onCategoryChange}
        onFilterChange={vi.fn()}
        onSearchChange={onSearchChange}
      />,
    );

    const all = screen.getByRole("button", { name: "All" });
    const talismans = screen.getByRole("button", { name: "Talismans" });
    expect(all).toHaveAttribute("aria-pressed", "true");
    expect(talismans).toHaveAttribute("aria-pressed", "false");
    await user.click(talismans);
    fireEvent.change(screen.getByRole("searchbox", { name: "Search equipment" }), {
      target: { value: "claw" },
    });

    expect(onCategoryChange).toHaveBeenCalledWith("talismans");
    expect(onSearchChange).toHaveBeenCalledWith("claw");
  });

  it("shows category-specific filters and reports their changes", async () => {
    const user = userEvent.setup();
    const onFilterChange = vi.fn();
    render(
      <EquipmentCatalogHeader
        filters={{ category: "armaments", search: "" }}
        onCategoryChange={vi.fn()}
        onFilterChange={onFilterChange}
        onSearchChange={vi.fn()}
      />,
    );

    expect(screen.getByRole("group", { name: "Equipment filters" }))
      .toBeInTheDocument();
    await user.selectOptions(
      screen.getByRole("combobox", { name: "Weapon type" }),
      "katana",
    );
    await user.selectOptions(
      screen.getByRole("combobox", { name: "Affinity" }),
      "cold",
    );

    expect(onFilterChange).toHaveBeenCalledWith("weaponType", "katana");
    expect(onFilterChange).toHaveBeenCalledWith("affinity", "cold");
  });

  it("has no automatically detectable accessibility violations", async () => {
    const { container } = render(
      <EquipmentCatalogHeader
        filters={{ category: "armaments", search: "" }}
        onCategoryChange={vi.fn()}
        onFilterChange={vi.fn()}
        onSearchChange={vi.fn()}
      />,
    );

    await expectNoAccessibilityViolations(container);
  });
});
