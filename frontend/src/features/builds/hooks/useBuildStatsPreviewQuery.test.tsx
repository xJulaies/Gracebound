import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import type { PropsWithChildren } from "react";
import { describe, expect, it, vi } from "vitest";
import { calculateBuildStats } from "../api/builds.api";
import type { BuildStatsInput } from "../types/build.types";
import { useBuildStatsPreviewQuery } from "./useBuildStatsPreviewQuery";

vi.mock("../api/builds.api", () => ({
  calculateBuildStats: vi.fn(),
}));

const initialInput: BuildStatsInput = {
  characterClassId: "vagabond",
  stats: {
    vigor: 15,
    mind: 10,
    endurance: 11,
    strength: 14,
    dexterity: 13,
    intelligence: 9,
    faith: 9,
    arcane: 7,
  },
};

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return function Wrapper({ children }: PropsWithChildren) {
    return (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    );
  };
}

describe("useBuildStatsPreviewQuery", () => {
  it("waits for quiet input before requesting changed stats", async () => {
    vi.mocked(calculateBuildStats).mockResolvedValue({
      status: 200,
      message: "Build stats calculated",
      data: [],
    });
    const { rerender } = renderHook(
      ({ input }) => useBuildStatsPreviewQuery(input, 20),
      { initialProps: { input: initialInput }, wrapper: createWrapper() },
    );

    await waitFor(() => expect(calculateBuildStats).toHaveBeenCalledTimes(1));

    rerender({
      input: {
        ...initialInput,
        stats: { ...initialInput.stats, strength: 15 },
      },
    });
    expect(calculateBuildStats).toHaveBeenCalledTimes(1);

    await waitFor(() => expect(calculateBuildStats).toHaveBeenCalledTimes(2));
    expect(calculateBuildStats).toHaveBeenLastCalledWith(
      expect.objectContaining({ stats: expect.objectContaining({ strength: 15 }) }),
      expect.any(AbortSignal),
    );
  });
});
