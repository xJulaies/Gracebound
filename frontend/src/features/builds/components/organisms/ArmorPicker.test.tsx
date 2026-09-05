import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { useArmorQuery } from "../../../armor/hooks/useArmorQuery";
import type { Armor } from "../../../armor/types/armor.types";
import { ArmorPicker } from "./ArmorPicker";

vi.mock("../../../armor/hooks/useArmorQuery", () => ({ useArmorQuery: vi.fn() }));

const helmet = {
  id: "vagabond-knight-helm",
  name: "Vagabond Knight Helm",
  summary: null,
  description: "A well-worn knight's helm.",
  slot: "head",
  iconId: 1,
  iconUrl: "/helm.webp",
  weight: 4,
  poise: 7,
  damageNegation: { physical: 0.046, magic: 0.031 },
  resistances: { bleed: 23, frost: 23 },
  hasPassiveEffects: false,
  hasUnresolvedPassiveEffects: false,
  passiveEffects: {},
  gameVersion: "1.17.0",
} as Armor;

describe("ArmorPicker", () => {
  it("shows only the queried slot catalog and returns the selection", async () => {
    vi.mocked(useArmorQuery).mockReturnValue({
      isPending: false,
      isError: false,
      data: { status: 200, message: "Armor found", data: [helmet] },
    } as unknown as ReturnType<typeof useArmorQuery>);
    const onSelect = vi.fn();
    const user = userEvent.setup();

    render(
      <ArmorPicker
        onClose={vi.fn()}
        onSelect={onSelect}
        slot="head"
        slotLabel="Head"
      />,
    );

    expect(useArmorQuery).toHaveBeenCalledWith({ slot: "head", search: undefined });
    await user.click(screen.getByRole("button", { name: /Vagabond Knight Helm/ }));
    expect(onSelect).toHaveBeenCalledWith(helmet);
  });

  it("opens the reusable details preview without selecting the armor", async () => {
    vi.mocked(useArmorQuery).mockReturnValue({
      isPending: false,
      isError: false,
      data: { status: 200, message: "Armor found", data: [helmet] },
    } as unknown as ReturnType<typeof useArmorQuery>);
    const onSelect = vi.fn();
    const user = userEvent.setup();

    render(
      <ArmorPicker
        onClose={vi.fn()}
        onSelect={onSelect}
        slot="head"
        slotLabel="Head"
      />,
    );

    await user.click(screen.getByRole("button", { name: "Details" }));

    expect(screen.getByRole("complementary", {
      name: "Vagabond Knight Helm details",
    })).toHaveTextContent("A well-worn knight's helm.");
    expect(onSelect).not.toHaveBeenCalled();
  });

  it("closes when the free overlay area is clicked", async () => {
    vi.mocked(useArmorQuery).mockReturnValue({
      isPending: false,
      isError: false,
      data: { status: 200, message: "Armor found", data: [helmet] },
    } as unknown as ReturnType<typeof useArmorQuery>);
    const onClose = vi.fn();
    const user = userEvent.setup();

    render(
      <ArmorPicker
        onClose={onClose}
        onSelect={vi.fn()}
        slot="head"
        slotLabel="Head"
      />,
    );

    await user.click(screen.getByRole("dialog"));
    expect(onClose).toHaveBeenCalledOnce();
  });
});
