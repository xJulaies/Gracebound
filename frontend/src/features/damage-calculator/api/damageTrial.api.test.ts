import { afterEach, describe, expect, it, vi } from "vitest";
import { calculateSavedBuildDamage } from "./damageTrial.api";

afterEach(() => vi.unstubAllGlobals());

describe("calculateSavedBuildDamage", () => {
  it("sends one authenticated boss-damage request for the selected build action", async () => {
    const damage = {
      physical: 742,
      magic: 0,
      fire: 0,
      lightning: 0,
      holy: 0,
      total: 742,
    };
    const result = {
      attack: { id: "straight-sword-1h-light-1", name: "Light Attack", fpCost: 0 },
      attackRating: damage,
      offensiveOutput: damage,
      damage,
      totalDamage: 742,
      specialDamage: [],
      components: [{
        kind: "weapon-hit",
        sourceAttackId: 100000,
        offensiveOutput: damage,
        damage,
      }],
      target: { id: "margit-the-fell-omen", name: "Margit, the Fell Omen" },
      accuracy: "estimated",
      limitations: [],
      buffs: [],
      greatRune: null,
      crystalTears: [],
      talismans: [],
      weapon: {
        id: "longsword",
        name: "Longsword",
        gameVersion: "1.17.0",
        upgradeLevel: 20,
        affinity: "standard",
      },
    };
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({
      status: 200,
      message: "Build damage calculated",
      data: [result],
    }), { status: 200, headers: { "Content-Type": "application/json" } }));
    vi.stubGlobal("fetch", fetchMock);
    const getToken = vi.fn().mockResolvedValue("trial-token");

    const response = await calculateSavedBuildDamage(
      "build/with spaces",
      {
        weaponSlotId: "rightHand1",
        attackId: "straight-sword-1h-light-1",
        skillBuffActive: false,
        bossId: "margit-the-fell-omen",
        greatRuneActive: true,
        wondrousPhysickActive: false,
        activeBuffSpellIds: ["golden-vow"],
        weaponBuffActive: false,
      },
      getToken,
    );

    expect(response.data[0]).toEqual(result);
    expect(getToken).toHaveBeenCalledOnce();
    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost:3000/api/me/builds/build%2Fwith%20spaces/calculate-damage",
      expect.objectContaining({
        method: "POST",
        body: expect.any(String),
        headers: expect.any(Headers),
      }),
    );
    const request = fetchMock.mock.calls[0]?.[1] as RequestInit;
    expect(JSON.parse(String(request.body))).toEqual({
      greatRuneActive: true,
      wondrousPhysickActive: false,
      activeBuffSpellIds: ["golden-vow"],
      weaponBuffActive: false,
      bossId: "margit-the-fell-omen",
      weaponSlotId: "rightHand1",
      attackId: "straight-sword-1h-light-1",
      skillBuffActive: false,
    });
    expect((request.headers as Headers).get("Authorization")).toBe("Bearer trial-token");
  });

  it("forwards abort signals for superseded attack requests", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({
      status: 200,
      message: "Build damage calculated",
      data: [],
    }), { status: 200, headers: { "Content-Type": "application/json" } }));
    vi.stubGlobal("fetch", fetchMock);
    const controller = new AbortController();

    await calculateSavedBuildDamage(
      "build-1",
      {
        spellId: "comet", charged: true, bossId: "rennala",
        greatRuneActive: false, wondrousPhysickActive: false,
        activeBuffSpellIds: [], weaponBuffActive: false,
      },
      async () => "trial-token",
      controller.signal,
    );

    expect(fetchMock).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({ signal: controller.signal }),
    );
  });
});
