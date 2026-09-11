import { afterEach, describe, expect, it, vi } from "vitest";
import { getAshesOfWar } from "./ashesOfWar.api";

afterEach(() => vi.unstubAllGlobals());

describe("getAshesOfWar", () => {
  it("passes compatibility filters and resolves icon URLs", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(
      new Response(JSON.stringify({
        status: 200,
        message: "Ashes of War found",
        data: [{
          id: "square-off",
          name: "Square Off",
          summary: null,
          description: null,
          iconId: 1,
          iconUrl: "/api/assets/icons/1",
          compatibleWeaponTypes: ["straight-sword"],
          compatibleAffinities: ["standard"],
          calculationStatus: "supported",
          buffEffect: {
            durationSeconds: 60,
            consumption: "duration",
            attackPowerMultipliers: {
              physical: 1.15, magic: 1, fire: 1, lightning: 1, holy: 1,
            },
            outgoingDamageMultipliers: {
              physical: 1, magic: 1, fire: 1, lightning: 1, holy: 1,
            },
            addedDamage: {
              physical: 0, magic: 0, fire: 0, lightning: 0, holy: 0,
            },
            addedStatusBuildup: {
              poison: 0, rot: 0, bleed: 0, frost: 0,
              sleep: 0, madness: 0, deathBlight: 0,
            },
            poiseDamageMultiplier: 1.1,
            limitations: [],
          },
          attacks: [{ id: "light-follow-up", name: "Light Follow-up", fpCost: 6 }],
          gameVersion: "1.17.0",
        }],
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
