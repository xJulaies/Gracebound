import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useDeleteBuildMutation, useDuplicateBuildMutation } from "../../hooks/useBuildRecordActions";
import { useOwnedBuildsQuery } from "../../hooks/useBuildQueries";
import type { Build } from "../../types/build.types";
import { BuildRecordsCollection } from "./BuildRecordsCollection";
import type { ReactNode } from "react";

vi.mock("../../hooks/useBuildQueries", () => ({ useOwnedBuildsQuery: vi.fn() }));
vi.mock("../../hooks/useBuildRecordActions", () => ({
  useDeleteBuildMutation: vi.fn(),
  useDuplicateBuildMutation: vi.fn(),
}));
vi.mock("@tanstack/react-router", () => ({
  Link: ({ children, className, params }: {
    children: ReactNode;
    className?: string;
    params: { buildId: string };
  }) => <a className={className} href={`/my-builds/${params.buildId}/edit`}>{children}</a>,
}));

const publicBuild = createBuild("public-build", "Golden Order", "public");
const privateBuild = createBuild("private-build", "Hidden Blade", "private");
const duplicate = vi.fn();
const remove = vi.fn();

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(useOwnedBuildsQuery).mockImplementation((visibility) => ({
    isAuthLoaded: true,
    isSignedIn: true,
    query: {
      data: {
        pages: [{
          status: 200,
          message: "Builds found",
          data: visibility === "public"
            ? [publicBuild]
            : visibility === "private"
              ? [privateBuild]
              : [publicBuild, privateBuild],
        }],
        pageParams: [1],
      },
      isPending: false,
      isError: false,
      refetch: vi.fn(),
      hasNextPage: false,
      isFetchingNextPage: false,
      fetchNextPage: vi.fn(),
    },
  } as unknown as ReturnType<typeof useOwnedBuildsQuery>));
  vi.mocked(useDuplicateBuildMutation).mockReturnValue({
    mutate: duplicate,
    isPending: false,
    error: null,
    variables: undefined,
  } as unknown as ReturnType<typeof useDuplicateBuildMutation>);
  vi.mocked(useDeleteBuildMutation).mockReturnValue({
    mutate: remove,
    isPending: false,
    error: null,
    variables: undefined,
  } as unknown as ReturnType<typeof useDeleteBuildMutation>);
});

describe("BuildRecordsCollection", () => {
  it("filters records by visibility without hiding the active filter state", async () => {
    const user = userEvent.setup();
    render(<BuildRecordsCollection />);

    await user.click(screen.getByRole("button", { name: "Private" }));
    expect(screen.getByRole("heading", { name: "Hidden Blade" })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Golden Order" })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Private" })).toHaveAttribute("aria-pressed", "true");
    expect(useOwnedBuildsQuery).toHaveBeenLastCalledWith("private");
    expect(screen.getByRole("link", { name: "Edit" })).toHaveAttribute(
      "href",
      "/my-builds/private-build/edit",
    );
  });

  it("duplicates the selected build", async () => {
    const user = userEvent.setup();
    render(<BuildRecordsCollection />);

    await user.click(screen.getAllByRole("button", { name: "Duplicate" })[0]!);
    expect(duplicate).toHaveBeenCalledWith(publicBuild);
  });

  it("requires confirmation before deleting a build", async () => {
    const user = userEvent.setup();
    render(<BuildRecordsCollection />);

    await user.click(screen.getAllByRole("button", { name: "Delete" })[0]!);
    expect(remove).not.toHaveBeenCalled();
    expect(screen.getByRole("dialog", { name: "Erase this record?" })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Delete permanently" }));
    expect(remove).toHaveBeenCalledWith(publicBuild.id, expect.any(Object));
  });
});

function createBuild(id: string, name: string, visibility: Build["visibility"]): Build {
  return {
    id,
    gameVersion: "1.17.0",
    name,
    description: "A recorded build",
    visibility,
    characterClassId: "vagabond",
    level: 9,
    stats: {
      vigor: 15, mind: 10, endurance: 11, strength: 14,
      dexterity: 13, intelligence: 9, faith: 9, arcane: 7,
    },
    memoryStoneCount: 0,
    spellIds: [],
    equipment: {
      weaponSlots: {
        rightHand1: null, rightHand2: null, rightHand3: null,
        leftHand1: null, leftHand2: null, leftHand3: null,
      },
      catalyst: null,
      armor: { headId: null, chestId: null, armsId: null, legsId: null },
      greatRuneId: null,
      crystalTearIds: [],
      talismanIds: [],
      buffSpellIds: [],
      weaponBuff: null,
    },
    createdAt: "2026-09-07T10:00:00.000Z",
    updatedAt: "2026-09-07T10:00:00.000Z",
  };
}
