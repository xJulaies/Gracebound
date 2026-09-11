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
          summary: null,
          description: null,
          categoryId: 1,
          weaponTypeId: 1,
          weaponType: "straight-sword",
          weight: 3.5,
          iconId: 100,
          iconUrl: "/api/assets/icons/100",
          swordArtId: null,
          canChangeAffinity: true,
          castingTypes: [],
          requirements: {
            strength: 10,
            dexterity: 10,
            intelligence: 0,
            faith: 0,
            arcane: 0,
          },
          statusBuildup: null,
          variants: [{ id: "longsword-standard", affinity: "standard", maxUpgradeLevel: 25 }],
          attacks: [{ id: "light-attack", name: "Light Attack" }],
          skills: [],
          gameVersion: "1.17.0",
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
