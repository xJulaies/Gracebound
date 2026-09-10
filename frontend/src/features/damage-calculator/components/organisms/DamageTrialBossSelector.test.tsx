import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { expectNoAccessibilityViolations } from "../../../../test/accessibility";
import { useBossesQuery } from "../../../bosses/hooks/useBossesQuery";
import type { Boss } from "../../../bosses/types/boss.types";
import { DamageTrialBossSelector } from "./DamageTrialBossSelector";

vi.mock("../../../bosses/hooks/useBossesQuery", () => ({ useBossesQuery: vi.fn() }));

const boss = createBoss();

describe("DamageTrialBossSelector", () => {
  it("selects a boss accessibly", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    vi.mocked(useBossesQuery).mockReturnValue({
      data: { status: 200, message: "Bosses found", data: [boss] },
      isPending: false,
      isError: false,
      refetch: vi.fn(),
    } as unknown as ReturnType<typeof useBossesQuery>);

    const { container } = render(
      <DamageTrialBossSelector onSelect={onSelect} selectedBoss={null} />,
    );
    await user.click(screen.getByRole("button", { name: /^Boss:/ }));
    await user.click(screen.getByRole("button", { name: /Margit/ }));
    expect(onSelect).toHaveBeenCalledWith(boss);

    await expectNoAccessibilityViolations(container);
  });
});

function createBoss(): Boss {
  return {
    id: "margit-the-fell-omen",
    name: "Margit, the Fell Omen",
    imageUrl: "/api/assets/bosses/margit-the-fell-omen",
    encounters: [{ region: "limgrave", location: "Stormveil Castle", locationType: "legacy-dungeon" }],
    rank: "major",
    progression: "required",
    rewardsGreatRune: false,
    rewardsRemembrance: false,
    health: 4174,
    defense: { physical: 103, magic: 103, fire: 103, lightning: 103, holy: 103 },
    absorption: {
      physical: { standard: 0, slash: 0, strike: 0, pierce: 0 },
      magic: 20,
      fire: 0,
      lightning: 0,
      holy: 40,
    },
    gameVersion: "1.17.0",
  };
}
