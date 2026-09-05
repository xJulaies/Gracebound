import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { EquipmentCatalogResults } from "./EquipmentCatalogResults";

describe("EquipmentCatalogResults", () => {
  it("renders independent states and opens reusable item details", async () => {
    const user = userEvent.setup();
    const scrollTo = vi.spyOn(window, "scrollTo").mockImplementation(() => undefined);
    Object.defineProperty(window, "scrollY", { configurable: true, value: 640 });
    render(<EquipmentCatalogResults groups={[
      {
        category: "armaments",
        label: "Armaments",
        hasNextPage: false,
        isPending: false,
        isError: false,
        isFetchingNextPage: false,
        loadMore: () => undefined,
        items: [{
          category: "armaments",
          description: "A well-crafted straight sword.",
          id: "longsword",
          name: "Longsword",
          iconUrl: "/longsword.webp",
          metadata: ["Straight Sword"],
          summary: null,
          source: {
            id: "longsword",
            name: "Longsword",
            summary: null,
            description: "A well-crafted straight sword.",
            categoryId: 1,
            weaponTypeId: 1,
            weaponType: "straight-sword",
            weight: 3.5,
            iconId: 1,
            iconUrl: "/longsword.webp",
            swordArtId: null,
            canChangeAffinity: true,
            castingTypes: [],
            requirements: {
              strength: 10,
              dexterity: 10,
              intelligence: 0,
              faith: 0,
              arcane: 0,
            },
            statusBuildup: null,
            variants: [{ id: "longsword", affinity: "standard", maxUpgradeLevel: 25 }],
            attacks: [],
            skills: [],
            gameVersion: "1.17.0",
          },
          weight: 3.5,
        }],
      },
      {
        category: "armor",
        label: "Armor",
        hasNextPage: false,
        isPending: false,
        isError: false,
        isFetchingNextPage: false,
        loadMore: () => undefined,
        items: [],
      },
      {
        category: "talismans",
        label: "Talismans",
        hasNextPage: false,
        isPending: false,
        isError: true,
        isFetchingNextPage: false,
        loadMore: () => undefined,
        items: [],
      },
    ]} />);

    expect(screen.getByRole("heading", { name: "Longsword" })).toBeInTheDocument();
    expect(screen.getByText("No armor match your search.")).toBeInTheDocument();
    expect(screen.getByRole("alert")).toHaveTextContent("Talismans are currently unavailable.");
    const openDetails = screen.getByRole("button", { name: "View details for Longsword" });
    await user.click(openDetails);
    expect(screen.getByRole("dialog", { name: "Longsword details dialog" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Required attributes" })).toBeInTheDocument();
    expect(document.body).toHaveStyle({ overflow: "hidden" });
    const closeDetails = screen.getByRole("button", { name: "Close" });
    expect(closeDetails).toHaveFocus();
    await user.tab();
    expect(closeDetails).toHaveFocus();
    await user.tab({ shift: true });
    expect(closeDetails).toHaveFocus();
    Object.defineProperty(window, "scrollY", { configurable: true, value: 0 });
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(openDetails).toHaveFocus();
    expect(scrollTo).toHaveBeenCalledWith({ behavior: "auto", left: 0, top: 640 });
    expect(document.body.style.overflow).toBe("");
    scrollTo.mockRestore();
  });
});
