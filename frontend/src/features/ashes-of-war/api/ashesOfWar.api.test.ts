import { afterEach, describe, expect, it, vi } from "vitest";
import { getAshesOfWar } from "./ashesOfWar.api";

afterEach(() => vi.unstubAllGlobals());

describe("getAshesOfWar", () => {
  it("passes compatibility filters and resolves icon URLs", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(
      new Response(JSON.stringify({
        status: 200,
        message: "Ashes of War found",
        data: [{ id: "square-off", iconUrl: "/api/assets/icons/1" }],
      }), { status: 200, headers: { "Content-Type": "application/json" } }),
    ));

    const response = await getAshesOfWar({
      weaponType: "straight-sword",
      affinity: "standard",
    });

    expect(response.data[0]?.iconUrl).toBe(
      "http://localhost:3000/api/assets/icons/1",
    );
    expect(fetch).toHaveBeenCalledWith(
      "http://localhost:3000/api/ashes-of-war?weaponType=straight-sword&affinity=standard",
      expect.any(Object),
    );
  });
});
