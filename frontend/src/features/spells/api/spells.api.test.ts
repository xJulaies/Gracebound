import { afterEach, describe, expect, it, vi } from "vitest";
import { getSpells } from "./spells.api";

afterEach(() => vi.unstubAllGlobals());

describe("getSpells", () => {
  it("forwards catalog filters and returns frontend-ready icon URLs", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(
      new Response(JSON.stringify({
        status: 200,
        message: "Spells found",
        data: [{ id: "gravity-well", name: "Gravity Well", iconUrl: "/api/assets/icons/4000" }],
      }), {
        status: 200,
        headers: { "Content-Type": "application/json", "X-Total-Count": "5" },
      }),
    ));

    const response = await getSpells({
      type: "sorcery",
      school: "gravity",
      search: "well",
      page: 2,
      limit: 24,
    });

    expect(response.data[0]?.iconUrl).toBe(
      "http://localhost:3000/api/assets/icons/4000",
    );
    expect(response.totalCount).toBe(5);
    expect(fetch).toHaveBeenCalledWith(
      "http://localhost:3000/api/spells?type=sorcery&school=gravity&search=well&page=2&limit=24",
      expect.any(Object),
    );
  });
});
