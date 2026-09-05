import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { usePublicBuildsQuery } from "../../hooks/useBuildQueries";
import type { Build } from "../../types/build.types";
import { PublicBuildGallery } from "./PublicBuildGallery";

vi.mock("../../hooks/useBuildQueries", () => ({
  usePublicBuildsQuery: vi.fn(),
}));

const publicBuild: Build = {
  id: "moonveil-mage",
  name: "Moonveil Mage",
  description: "A fast intelligence build.",
  characterClassId: "prisoner",
  level: 125,
  stats: {
    vigor: 40,
    mind: 30,
    endurance: 20,
    strength: 12,
    dexterity: 18,
    intelligence: 60,
    faith: 8,
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
  visibility: "public",
  createdAt: "2026-09-03T00:00:00.000Z",
  updatedAt: "2026-09-03T00:00:00.000Z",
};

describe("PublicBuildGallery", () => {
  it("renders public build cards", () => {
    vi.mocked(usePublicBuildsQuery).mockReturnValue({
      isPending: false,
      isError: false,
      data: { status: 200, message: "Builds found", data: [publicBuild] },
    } as unknown as ReturnType<typeof usePublicBuildsQuery>);

    render(<PublicBuildGallery />);

    expect(screen.getByRole("heading", { name: "Moonveil Mage" })).toBeInTheDocument();
    expect(screen.getByText("Level 125")).toBeInTheDocument();
    expect(screen.getByText("Intelligence")).toBeInTheDocument();
  });

  it("renders a dedicated empty state", () => {
    vi.mocked(usePublicBuildsQuery).mockReturnValue({
      isPending: false,
      isError: false,
      data: { status: 200, message: "Builds found", data: [] },
    } as unknown as ReturnType<typeof usePublicBuildsQuery>);

    render(<PublicBuildGallery />);

    expect(screen.getByText("No public builds have been shared yet.")).toBeInTheDocument();
  });

  it("allows a failed request to be retried", async () => {
    const refetch = vi.fn();
    vi.mocked(usePublicBuildsQuery).mockReturnValue({
      isPending: false,
      isError: true,
      refetch,
    } as unknown as ReturnType<typeof usePublicBuildsQuery>);
    const user = userEvent.setup();

    render(<PublicBuildGallery />);
    await user.click(screen.getByRole("button", { name: "Try again" }));

    expect(refetch).toHaveBeenCalledOnce();
  });
});
