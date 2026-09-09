import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import type { Build } from "../../../builds/types/build.types";
import { useDamageTrialActionsQuery } from "../../hooks/useDamageTrialActionsQuery";
import type { DamageTrialActionOption } from "../../types/damageTrial.types";
import { DamageTrialActionSelector } from "./DamageTrialActionSelector";

vi.mock("../../hooks/useDamageTrialActionsQuery", () => ({ useDamageTrialActionsQuery: vi.fn() }));

describe("DamageTrialActionSelector", () => {
  it("selects a source before exposing its reusable attack cards", async () => {
    const user = userEvent.setup();
    const onExecute = vi.fn();
    vi.mocked(useDamageTrialActionsQuery).mockReturnValue({
      data: options,
      isPending: false,
      isError: false,
    } as unknown as ReturnType<typeof useDamageTrialActionsQuery>);

    render(
      <DamageTrialActionSelector
        build={{ id: "build-1" } as Build}
        disabled={false}
        isAttacking={false}
        onExecute={onExecute}
      />,
    );
    expect(screen.getByRole("heading", { name: "Choose weapon" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Armaments" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Light attack/i })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Academy Glintstone Staff/i })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /^Cast/i })).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /Longsword.*Right hand 1/i }));
    await user.click(screen.getByRole("button", { name: /Light attack.*Longsword/i }));
    expect(onExecute).toHaveBeenCalledWith(options[0]?.action);

    await user.click(screen.getByRole("button", { name: /Academy Glintstone Staff/i }));
    expect(screen.getByRole("button", { name: /^Cast.*Comet/i })).toBeInTheDocument();
  });
});

const options: DamageTrialActionOption[] = [
  {
    id: "rightHand1:attack:light",
    sourceId: "armament:rightHand1",
    sourceLabel: "Longsword +25",
    sourceIconUrl: "/longsword.webp",
    sourceDetail: "Right hand 1",
    action: { kind: "weapon-attack", weaponSlotId: "rightHand1", attackId: "light", label: "Light attack (R1)", skillBuffActive: false },
    sourceName: "Longsword +25",
    iconUrl: "/longsword.webp",
    detail: "Right hand 1",
    group: "armament",
  },
  {
    id: "spell:comet:normal",
    sourceId: "armament:leftHand1",
    sourceLabel: "Academy Glintstone Staff +25",
    sourceIconUrl: "/staff.webp",
    sourceDetail: "Left hand 1",
    action: { kind: "spell", spellId: "comet", label: "Cast", charged: false },
    sourceName: "Comet",
    iconUrl: "/comet.webp",
    detail: "Sorcery · 24 FP",
    group: "spell",
  },
];
