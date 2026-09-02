import { useAuth } from "@clerk/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { getOwnedBuilds, getPublicBuilds } from "../api/builds.api";
import type { Build } from "../types/build.types";
import { BuildIntegrationPanel } from "./BuildIntegrationPanel";

vi.mock("@clerk/react", () => ({
  useAuth: vi.fn(),
}));

vi.mock("../api/builds.api", () => ({
  getOwnedBuilds: vi.fn(),
  getPublicBuilds: vi.fn(),
}));

const publicBuild: Build = {
  id: "public-build",
  name: "Public Build",
  description: "",
  characterClassId: null,
  level: 100,
  stats: {
    vigor: 40,
    mind: 20,
    endurance: 25,
    strength: 30,
    dexterity: 30,
    intelligence: 30,
    faith: 10,
    arcane: 10,
  },
  memoryStoneCount: 0,
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
    armor: {
      headId: null,
      chestId: null,
      armsId: null,
      legsId: null,
    },
    greatRuneId: null,
    crystalTearIds: [],
    talismanIds: [],
    buffSpellIds: [],
    weaponBuff: null,
  },
  visibility: "public",
  createdAt: "2026-08-19T00:00:00.000Z",
  updatedAt: "2026-08-19T00:00:00.000Z",
};

function renderPanel() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  render(
    <QueryClientProvider client={queryClient}>
      <BuildIntegrationPanel />
    </QueryClientProvider>,
  );
}

beforeEach(() => {
  vi.mocked(getPublicBuilds).mockResolvedValue({
    status: 200,
    message: "Builds found",
    data: [publicBuild],
  });
  vi.mocked(getOwnedBuilds).mockResolvedValue({
    status: 200,
    message: "Builds found",
    data: [],
  });
});

describe("BuildIntegrationPanel", () => {
  it("shows public builds and the signed-out protected state", async () => {
    vi.mocked(useAuth).mockReturnValue({
      isLoaded: true,
      isSignedIn: false,
      userId: null,
      getToken: vi.fn(),
    } as unknown as ReturnType<typeof useAuth>);

    renderPanel();

    expect(await screen.findByText(/Public Build/)).toBeInTheDocument();
    expect(
      screen.getByText("Sign in to verify the protected build endpoint."),
    ).toBeInTheDocument();
    expect(getOwnedBuilds).not.toHaveBeenCalled();
  });

  it("loads protected builds for a signed-in user", async () => {
    const getToken = vi.fn().mockResolvedValue("session-token");
    vi.mocked(useAuth).mockReturnValue({
      isLoaded: true,
      isSignedIn: true,
      userId: "user-1",
      getToken,
    } as unknown as ReturnType<typeof useAuth>);
    vi.mocked(getOwnedBuilds).mockResolvedValue({
      status: 200,
      message: "Builds found",
      data: [{ ...publicBuild, id: "owned-build", name: "Owned Build" }],
    });

    renderPanel();

    expect(await screen.findByText(/Owned Build/)).toBeInTheDocument();
    expect(getOwnedBuilds).toHaveBeenCalledWith(getToken);
  });
});
