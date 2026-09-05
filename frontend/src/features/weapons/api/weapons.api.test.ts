import { afterEach, describe, expect, it, vi } from "vitest";
import { getWeapons } from "./weapons.api";

afterEach(() => vi.unstubAllGlobals());

describe("getWeapons", () => {
  it("returns frontend-ready absolute icon URLs", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(
      new Response(JSON.stringify({
        status: 200,
        message: "Weapons found",
        data: [{
          id: "longsword",
          name: "Longsword",
          iconUrl: "/api/assets/icons/100",
        }],
      }), {
        status: 200,
        headers: { "Content-Type": "application/json", "X-Total-Count": "308" },
      }),
    ));

    const response = await getWeapons({ search: "long" });

    expect(response.data[0]?.iconUrl).toBe(
      "http://localhost:3000/api/assets/icons/100",
    );
    expect(response.totalCount).toBe(308);
    expect(fetch).toHaveBeenCalledWith(
      "http://localhost:3000/api/weapons?page=1&limit=100&search=long",
      expect.any(Object),
    );
  });
});
