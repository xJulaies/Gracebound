import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import type { Spell } from "../../types/spell.types";
import { SpellCatalogResults } from "./SpellCatalogResults";

describe("SpellCatalogResults", () => {
  it("opens and closes spell details while restoring focus", async () => {
    const user = userEvent.setup();
    render(
      <SpellCatalogResults
        hasNextPage={false}
        isError={false}
        isFetchingNextPage={false}
        isPending={false}
        onLoadMore={vi.fn()}
        spells={[gravityWell]}
      />,
    );

    const opener = screen.getByRole("button", { name: "View details for Gravity Well" });
    await user.click(opener);

    expect(screen.getByRole("dialog", { name: "Gravity Well details dialog" }))
      .toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Required attributes" }))
      .toBeInTheDocument();
    expect(screen.getByText("Gravity")).toBeInTheDocument();
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(opener).toHaveFocus();
  });
});

const gravityWell: Spell = {
  id: "gravity-well",
  name: "Gravity Well",
  summary: "Fires a projectile of condensed gravitational force.",
  description: "A gravitational technique studied in Sellia.",
  type: "sorcery",
  schools: ["gravity"],
  fpCost: 12,
  chargedFpCost: 18,
  sustainedFpCost: null,
  slotsRequired: 1,
  requirements: { intelligence: 17, faith: 0, arcane: 0 },
  iconId: 1,
  iconUrl: "/gravity-well.webp",
  calculationStatus: "supported",
  buffEffect: null,
  attack: null,
  chargedAttack: null,
  gameVersion: "1.17.0",
};
