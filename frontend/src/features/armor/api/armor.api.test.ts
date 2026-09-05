import { afterEach, describe, expect, it, vi } from "vitest";
import { getArmor } from "./armor.api";

afterEach(() => vi.unstubAllGlobals());

describe("getArmor", () => {
  it("passes slot and search filters and resolves icon URLs", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(
      new Response(JSON.stringify({
        status: 200,
        message: "Armor found",
        data: [{ id: "vagabond-knight-helm", iconUrl: "/api/assets/icons/1" }],
      }), {
        status: 200,
        headers: { "Content-Type": "application/json", "X-Total-Count": "42" },
      }),
    ));

    const response = await getArmor({
      slot: "head",
      search: "vagabond",
      page: 2,
      limit: 24,
    });

    expect(response.data[0]?.iconUrl).toBe("http://localhost:3000/api/assets/icons/1");
    expect(response.totalCount).toBe(42);
    expect(fetch).toHaveBeenCalledWith(
      "http://localhost:3000/api/armor?slot=head&search=vagabond&page=2&limit=24",
      expect.any(Object),
    );
  });
});
