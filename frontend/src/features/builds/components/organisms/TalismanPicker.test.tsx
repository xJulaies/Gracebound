import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { useTalismansQuery } from "../../../talismans/hooks/useTalismansQuery";
import type { Talisman } from "../../../talismans/types/talisman.types";
import { TalismanPicker } from "./TalismanPicker";

vi.mock("../../../talismans/hooks/useTalismansQuery", () => ({
  useTalismansQuery: vi.fn(),
}));

const axeTalisman: Talisman = {
  id: "axe-talisman",
  name: "Axe Talisman",
  summary: "Enhances charge attacks.",
  description: "A talisman depicting an axe and a warrior.",
  iconId: 2130,
  iconUrl: "/axe-talisman.webp",
  weight: 0.8,
  calculationStatus: "supported",
  effects: {
    chargedAttackDamageMultipliers: {
      physical: 1.1,
      magic: 1.1,
      fire: 1.1,
      lightning: 1.1,
      holy: 1.1,
    },
  },
  gameVersion: "1.17.0",
};

describe("TalismanPicker", () => {
  it("filters and returns the selected talisman", async () => {
    mockTalismans();
    const onSelect = vi.fn();
    const user = userEvent.setup();

    render(
      <TalismanPicker
        onClose={vi.fn()}
        onSelect={onSelect}
        slotLabel="Talisman 1"
      />,
    );

    await user.type(screen.getByRole("searchbox", { name: "Search talismans" }), "axe");
    await user.click(screen.getByRole("button", { name: /Axe Talisman/ }));
    expect(onSelect).toHaveBeenCalledWith(axeTalisman);
  });

  it("opens details without selecting the talisman", async () => {
    mockTalismans();
    const onSelect = vi.fn();
    const user = userEvent.setup();

    render(
      <TalismanPicker
        onClose={vi.fn()}
        onSelect={onSelect}
        slotLabel="Talisman 1"
      />,
    );

    await user.click(screen.getByRole("button", { name: "Details" }));

    expect(screen.getByRole("complementary", {
      name: "Axe Talisman details",
    })).toHaveTextContent("Enhances charge attacks.");
    expect(screen.getByText("Supported")).toBeInTheDocument();
    expect(screen.getByText("Charged attacks")).toBeInTheDocument();
    expect(screen.getByText("+10%")).toBeInTheDocument();
    expect(onSelect).not.toHaveBeenCalled();
  });
});

function mockTalismans() {
  vi.mocked(useTalismansQuery).mockReturnValue({
    isPending: false,
    isError: false,
    data: { status: 200, message: "Talismans found", data: [axeTalisman] },
  } as unknown as ReturnType<typeof useTalismansQuery>);
}
