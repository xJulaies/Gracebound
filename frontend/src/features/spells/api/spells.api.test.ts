import { afterEach, describe, expect, it, vi } from "vitest";
import { getSpells } from "./spells.api";

afterEach(() => vi.unstubAllGlobals());

describe("getSpells", () => {
  it("forwards catalog filters and returns frontend-ready icon URLs", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(
      new Response(JSON.stringify({
        status: 200,
        message: "Spells found",
        data: [{
          id: "gravity-well",
          name: "Gravity Well",
          summary: null,
          description: null,
          type: "sorcery",
          schools: ["gravity"],
          fpCost: 12,
          chargedFpCost: null,
          sustainedFpCost: null,
          slotsRequired: 1,
          requirements: { intelligence: 17, faith: 0, arcane: 0 },
          iconId: 4000,
          iconUrl: "/api/assets/icons/4000",
          calculationStatus: "supported",
          buffEffect: {
            slot: "body",
            durationSeconds: 30,
            outgoingDamageMultipliers: {
              physical: 1.2, magic: 1, fire: 1.2, lightning: 1, holy: 1,
            },
            weaponAddedDamageScaling: {
              physical: 0, magic: 0, fire: 0, lightning: 0, holy: 0,
            },
            weaponAddedStatusBuildup: {
              poison: 0, rot: 0, bleed: 0, frost: 0,
              sleep: 0, madness: 0, deathBlight: 0,
            },
            limitations: [],
          },
          attack: null,
          chargedAttack: null,
          gameVersion: "1.17.0",
        }],
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
