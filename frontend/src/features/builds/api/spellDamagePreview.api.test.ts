import { afterEach, describe, expect, it, vi } from "vitest";
import type { Spell } from "../../spells/types/spell.types";
import type { EquippedWeapon } from "../types/editor.types";
import { getSpellOffensePreview } from "./spellDamagePreview.api";

afterEach(() => vi.unstubAllGlobals());

describe("getSpellOffensePreview", () => {
  it("calculates normal and charged casts without temporary buffs", async () => {
    const fetchMock = vi.fn().mockImplementation(() => Promise.resolve(new Response(JSON.stringify({
      status: 200,
      message: "Damage calculated",
      data: [{ attackRating: { total: 250 }, offensiveOutput: { total: 310 } }],
    }), { status: 200, headers: { "Content-Type": "application/json" } })));
    vi.stubGlobal("fetch", fetchMock);

    const spell = {
      id: "comet",
      name: "Comet",
      summary: null,
      description: null,
      type: "sorcery",
      schools: ["glintstone"],
      calculationStatus: "supported",
      attack: { outputUnit: "per-hit", motionValues: emptyDamage(), additionalComponents: [] },
      chargedAttack: { outputUnit: "per-hit", motionValues: emptyDamage(), additionalComponents: [] },
      fpCost: 24,
      chargedFpCost: 30,
      sustainedFpCost: null,
      slotsRequired: 1,
      requirements: { intelligence: 52, faith: 0, arcane: 0 },
      iconId: 1,
      iconUrl: "/comet.webp",
      buffEffect: null,
      gameVersion: "1.17.0",
    } satisfies Spell;
    const catalyst = {
      weapon: {
        id: "academy-glintstone-staff",
        name: "Academy Glintstone Staff",
        castingTypes: ["sorcery"],
      },
      variantId: "academy-glintstone-staff",
      upgradeLevel: 20,
      ashOfWarId: null,
      ashOfWar: null,
    } as EquippedWeapon;

    const result = await getSpellOffensePreview(
      spell,
      catalyst,
      { vigor: 40, mind: 30, endurance: 20, strength: 10, dexterity: 12, intelligence: 60, faith: 7, arcane: 9 },
      {
        talismanIds: ["graven-school-talisman"], greatRuneId: null,
        crystalTearIds: [], buffSpellIds: ["golden-vow"],
      },
    );

    expect(result.actions.map(({ label }) => label)).toEqual(["Cast", "Charged cast"]);
    expect(fetchMock).toHaveBeenCalledTimes(2);
    const bodies = fetchMock.mock.calls.map(([, request]) => JSON.parse((request as RequestInit).body as string));
    expect(bodies).toEqual(expect.arrayContaining([
      expect.objectContaining({
        spellId: "comet",
        catalystWeaponId: "academy-glintstone-staff",
        catalystVariantId: "academy-glintstone-staff",
        upgradeLevel: 20,
        charged: false,
        talismanIds: ["graven-school-talisman"],
        crystalTearIds: [],
        buffSpellIds: ["golden-vow"],
      }),
      expect.objectContaining({ charged: true }),
    ]));
  });
});

function emptyDamage() {
  return { physical: 0, magic: 0, fire: 0, lightning: 0, holy: 0 };
}
