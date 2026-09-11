import { afterEach, describe, expect, it, vi } from "vitest";
import { getBosses } from "./bosses.api";

afterEach(() => vi.unstubAllGlobals());

describe("getBosses", () => {
  it("forwards catalog filters and pagination", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(JSON.stringify({
      status: 200,
      message: "Bosses found",
      data: [],
    }), {
      status: 200,
      headers: { "Content-Type": "application/json", "X-Total-Count": "7" },
    })));

    const response = await getBosses({
      region: "caelid",
      rewardsGreatRune: true,
      page: 2,
      limit: 24,
    });

    expect(response.totalCount).toBe(7);
    expect(fetch).toHaveBeenCalledWith(
      "http://localhost:3000/api/bosses?region=caelid&rewardsGreatRune=true&page=2&limit=24",
      expect.any(Object),
    );
  });

  it("resolves boss portrait asset URLs", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(JSON.stringify({
      status: 200,
      message: "Bosses found",
      data: [{
        id: "margit-the-fell-omen",
        name: "Margit, the Fell Omen",
        imageUrl: "/api/assets/bosses/margit-the-fell-omen",
        encounters: [{
          region: "limgrave",
          location: "Stormveil Castle",
          locationType: "legacy-dungeon",
        }],
        rank: "major",
        progression: "required",
        rewardsGreatRune: false,
        rewardsRemembrance: false,
        health: 4174,
        defense: { physical: 103, magic: 103, fire: 103, lightning: 103, holy: 103 },
        absorption: {
          physical: { standard: 0, slash: 0, strike: 0, pierce: 0 },
          magic: 0,
          fire: 0,
          lightning: 0,
          holy: 40,
        },
        phases: [{
          id: "margit-phase-two",
          name: "Phase 2",
          imageUrl: "/api/assets/bosses/margit-phase-two",
          phaseNumber: 2,
          trigger: { type: "health-percentage", threshold: 60 },
          health: 4174,
          defense: { physical: 103, magic: 103, fire: 103, lightning: 103, holy: 103 },
          absorption: {
            physical: { standard: 0, slash: 0, strike: 0, pierce: 0 },
            magic: 0,
            fire: 0,
            lightning: 0,
            holy: 40,
          },
        }],
        gameVersion: "1.17.0",
      }],
    }), { status: 200, headers: { "Content-Type": "application/json" } })));

    const response = await getBosses();

    expect(response.data[0]?.imageUrl).toBe(
      "http://localhost:3000/api/assets/bosses/margit-the-fell-omen",
    );
    expect(response.data[0]?.phases?.[0]?.imageUrl).toBe(
      "http://localhost:3000/api/assets/bosses/margit-phase-two",
    );
  });
});
