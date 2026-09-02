import { afterEach, describe, expect, it, vi } from "vitest";
import { calculateBuildStats } from "./builds.api";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("calculateBuildStats", () => {
  it("sends the character foundation to the build stats endpoint", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({ status: 200, message: "Build stats calculated", data: [] }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      ),
    );
    vi.stubGlobal("fetch", fetchMock);
    const input = {
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

    await calculateBuildStats(input);

    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost:3000/api/builds/calculate-stats",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify(input),
      }),
    );
    const request = fetchMock.mock.calls[0]?.[1] as RequestInit;
    expect(new Headers(request.headers).get("Content-Type")).toBe(
      "application/json",
    );
  });
});
