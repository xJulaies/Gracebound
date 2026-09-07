import { afterEach, describe, expect, it, vi } from "vitest";
import type { EquippedWeapon } from "../types/editor.types";
import { getWeaponOffensePreview } from "./damagePreview.api";

afterEach(() => vi.unstubAllGlobals());

describe("getWeaponOffensePreview", () => {
  it("calculates representative actions without temporary buffs", async () => {
    const fetchMock = vi.fn().mockImplementation(() => Promise.resolve(new Response(JSON.stringify({
      status: 200,
      message: "Damage calculated",
      data: [{ attackRating: { total: 350 }, offensiveOutput: { total: 420 } }],
    }), { status: 200, headers: { "Content-Type": "application/json" } })));
    vi.stubGlobal("fetch", fetchMock);

    const weapon = {
      weapon: {
        id: "longsword",
        name: "Longsword",
        summary: null,
        description: null,
        categoryId: 1,
        weaponTypeId: 1,
        weaponType: "straight-sword",
        weight: 3.5,
        iconId: 1,
        iconUrl: "/longsword.webp",
        swordArtId: null,
        canChangeAffinity: true,
        castingTypes: [],
        requirements: { strength: 10, dexterity: 10, intelligence: 0, faith: 0, arcane: 0 },
        statusBuildup: null,
        variants: [{ id: "longsword-heavy", affinity: "heavy", maxUpgradeLevel: 25 }],
        attacks: [
          { id: "straight-sword-1h-light-1", name: "Light attack" },
          { id: "straight-sword-1h-heavy-1", name: "Heavy attack" },
          { id: "straight-sword-1h-charged-heavy-1", name: "Charged heavy attack" },
          { id: "straight-sword-jumping-light-1", name: "Jump attack" },
        ],
        skills: [],
        gameVersion: "1.17.0",
      },
      variantId: "longsword-heavy",
      upgradeLevel: 20,
      ashOfWarId: null,
      ashOfWar: null,
    } satisfies EquippedWeapon;

    const result = await getWeaponOffensePreview(
      weapon,
      { vigor: 40, mind: 20, endurance: 30, strength: 60, dexterity: 20, intelligence: 9, faith: 9, arcane: 7 },
      {
        armorIds: [], talismanIds: ["axe-talisman"], greatRuneId: null,
        crystalTearIds: [], buffSpellIds: ["golden-vow"],
        weaponBuff: {
          spellId: "scholars-armament",
          catalystWeaponId: "academy-glintstone-staff",
          catalystVariantId: "academy-glintstone-staff-standard",
          upgradeLevel: 18,
        },
        skillBuffAshOfWarId: null,
      },
    );

    expect(result.actions.map(({ label }) => label)).toEqual([
      "Light attack (R1)", "Heavy attack (R2)", "Charged heavy attack", "Jump attack",
    ]);
    expect(result.actions[0]).toMatchObject({ attackRating: 350, offensiveOutput: 420 });
    expect(fetchMock).toHaveBeenCalledTimes(4);
    const bodies = fetchMock.mock.calls.map(([, request]) => JSON.parse((request as RequestInit).body as string));
    expect(bodies[0]).toMatchObject({
      attackId: "straight-sword-1h-light-1",
      crystalTearIds: [],
      buffSpellIds: ["golden-vow"],
      weaponBuff: {
        spellId: "scholars-armament",
        catalystWeaponId: "academy-glintstone-staff",
        catalystVariantId: "academy-glintstone-staff-standard",
        upgradeLevel: 18,
      },
      skillBuffAshOfWarId: null,
      talismanIds: ["axe-talisman"],
    });
  });
});
