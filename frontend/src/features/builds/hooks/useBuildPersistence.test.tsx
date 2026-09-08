import { useAuth } from "@clerk/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createOwnedBuild, updateOwnedBuild } from "../api/builds.api";
import type { BuildEditorDraft } from "../types/editor.types";
import { useBuildPersistence } from "./useBuildPersistence";

vi.mock("@clerk/react", () => ({ useAuth: vi.fn() }));
vi.mock("../api/builds.api", () => ({
  createOwnedBuild: vi.fn(),
  updateOwnedBuild: vi.fn(),
}));

const draft: BuildEditorDraft = {
  name: "Vagabond",
  description: "",
  visibility: "private",
  characterClassId: "vagabond",
  level: 9,
  stats: {
    vigor: 15, mind: 10, endurance: 11, strength: 14,
    dexterity: 13, intelligence: 9, faith: 9, arcane: 7,
  },
  memoryStoneCount: 0,
  spellIds: [],
  weaponSlots: {
    "right-hand-1": null, "right-hand-2": null, "right-hand-3": null,
    "left-hand-1": null, "left-hand-2": null, "left-hand-3": null,
  },
  catalyst: null,
  armor: {
    "armor-head": null, "armor-body": null,
    "armor-arms": null, "armor-legs": null,
  },
  greatRuneId: null,
  crystalTearIds: [],
  talismanIds: [],
  buffSpellIds: [],
  weaponBuff: null,
};

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(useAuth).mockReturnValue({
    getToken: vi.fn().mockResolvedValue("token"),
  } as unknown as ReturnType<typeof useAuth>);
  vi.mocked(createOwnedBuild).mockResolvedValue({
    status: 201,
    message: "Build created",
    data: [{ id: "build-1" }],
  } as Awaited<ReturnType<typeof createOwnedBuild>>);
  vi.mocked(updateOwnedBuild).mockResolvedValue({
    status: 200,
    message: "Build updated",
    data: [{ id: "build-1" }],
  } as Awaited<ReturnType<typeof updateOwnedBuild>>);
});

describe("useBuildPersistence", () => {
  it("creates once, updates afterwards, and creates again for save as new", async () => {
    const queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
    const wrapper = ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
    const { result } = renderHook(() => useBuildPersistence(), { wrapper });

    await act(() => result.current.mutateAsync({ draft, mode: "save" }));
    await waitFor(() => expect(result.current.savedBuildId).toBe("build-1"));
    expect(createOwnedBuild).toHaveBeenCalledOnce();

    await act(() => result.current.mutateAsync({ draft, mode: "save" }));
    expect(updateOwnedBuild).toHaveBeenCalledWith("build-1", expect.any(Object), expect.any(Function));

    await act(() => result.current.mutateAsync({ draft, mode: "save-as-new" }));
    expect(createOwnedBuild).toHaveBeenCalledTimes(2);
  });
});
