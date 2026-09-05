import { afterEach, describe, expect, it, vi } from "vitest";
import { getTalismans } from "./talismans.api";

afterEach(() => vi.unstubAllGlobals());

describe("getTalismans", () => {
  it("returns frontend-ready absolute icon URLs", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(
      new Response(JSON.stringify({
        status: 200,
        message: "Talismans found",
        data: [{ id: "axe-talisman", iconUrl: "/api/assets/icons/2130" }],
      }), {
        status: 200,
        headers: { "Content-Type": "application/json", "X-Total-Count": "116" },
      }),
    ));

    const response = await getTalismans({ search: "axe", page: 1, limit: 24 });

    expect(response.data[0]?.iconUrl).toBe(
      "http://localhost:3000/api/assets/icons/2130",
    );
    expect(response.totalCount).toBe(116);
    expect(fetch).toHaveBeenCalledWith(
      "http://localhost:3000/api/talismans?search=axe&page=1&limit=24",
      expect.any(Object),
    );
  });
});
