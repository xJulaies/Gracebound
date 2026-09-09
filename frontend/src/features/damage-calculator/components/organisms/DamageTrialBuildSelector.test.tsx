import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { expectNoAccessibilityViolations } from "../../../../test/accessibility";
import type { Build } from "../../../builds/types/build.types";
import { DamageTrialBuildSelector } from "./DamageTrialBuildSelector";

describe("DamageTrialBuildSelector", () => {
  it("exposes saved builds as one keyboard-operable radio group", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    const { container, rerender } = render(
      <DamageTrialBuildSelector
        builds={[createBuild("first", "Moonlit Knight"), createBuild("second", "Flame Warden")]}
        onSelect={onSelect}
        selectedBuildId={null}
      />,
    );

    const moonlitKnight = screen.getByRole("radio", { name: /Moonlit Knight/i });
    await user.click(moonlitKnight);
    expect(onSelect).toHaveBeenCalledWith("first");

    rerender(
      <DamageTrialBuildSelector
        builds={[createBuild("first", "Moonlit Knight"), createBuild("second", "Flame Warden")]}
        onSelect={onSelect}
        selectedBuildId="first"
      />,
    );
    expect(screen.getByRole("radio", { name: /Moonlit Knight/i })).toBeChecked();
    await expectNoAccessibilityViolations(container);
  });
});

function createBuild(id: string, name: string): Build {
  return {
    id,
    gameVersion: "1.17.0",
    name,
    description: "A saved build prepared for testing.",
    visibility: "private",
    characterClassId: "astrologer",
    level: 60,
    stats: {
      vigor: 30,
      mind: 28,
      endurance: 16,
      strength: 10,
      dexterity: 12,
      intelligence: 55,
      faith: 7,
      arcane: 9,
    },
    memoryStoneCount: 8,
    spellIds: [],
    equipment: {
      weaponSlots: {
        rightHand1: null,
        rightHand2: null,
        rightHand3: null,
        leftHand1: null,
        leftHand2: null,
        leftHand3: null,
      },
      catalyst: null,
      armor: { headId: null, chestId: null, armsId: null, legsId: null },
      greatRuneId: null,
      crystalTearIds: [],
      talismanIds: [],
      buffSpellIds: [],
      weaponBuff: null,
    },
    createdAt: "2026-09-08T10:00:00.000Z",
    updatedAt: "2026-09-08T10:00:00.000Z",
  };
}
