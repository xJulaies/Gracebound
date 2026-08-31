import type { RequestHandler } from "express";
import request from "supertest";
import { beforeEach, describe, expect, it } from "vitest";
import { createApp } from "../../app";
import { saveTalismanCatalog } from "../../infrastructure/regulation/services/saveTalismanCatalog";
import {
  REGULATION_TEST_GAME_VERSION,
  REGULATION_TEST_SOURCE_HASH,
} from "../../test/fixtures/regulationWeaponCatalog.fixture";
import { createTalismanFixture } from "../../test/fixtures/talisman.fixture";
import { useMongoMemoryServer } from "../../test/useMongoMemoryServer";
import { saveCharacterClassCatalog } from "../../infrastructure/regulation/services/saveCharacterClassCatalog";
import { createCharacterResourceCurvesFixture } from "../../test/fixtures/characterProgression.fixture";
import { saveArmorCatalog } from "../../infrastructure/regulation/services/saveArmorCatalog";
import { neutralArmorPassiveEffects, type ArmorData, type ArmorSlot } from "../armor/domain/armor.types";
import { saveWeaponCatalog } from "../../infrastructure/regulation/services/saveWeaponCatalog";
import { createRegulationWeaponCatalogFixture } from "../../test/fixtures/regulationWeaponCatalog.fixture";
import { saveSpellCatalog } from "../../infrastructure/regulation/services/saveSpellCatalog";
import type { SpellData } from "../spells/domain/spell.types";

const passThroughAuthentication: RequestHandler = (_request, _response, next) => next();
const app = createApp({
  authenticationMiddleware: passThroughAuthentication,
  getAuthenticatedUserId: () => null,
});

useMongoMemoryServer({ replicaSet: true });

beforeEach(async () => {
  await Promise.all([saveCharacterClassCatalog(characterClasses, createCharacterResourceCurvesFixture(), {
    gameVersion: REGULATION_TEST_GAME_VERSION,
    sourceHash: REGULATION_TEST_SOURCE_HASH,
  }), saveTalismanCatalog([
    createTalismanFixture("starscourge-heirloom", "Starscourge Heirloom", {
      attributeBonuses: { strength: 5 },
    }),
    createTalismanFixture("crimson-amber-medallion-plus-2", "Crimson Amber Medallion +2", {
      resourceMultipliers: { maxHp: 1.08 },
    }),
    createTalismanFixture("moon-of-nokstella", "Moon of Nokstella", {
      utilityEffects: { memorySlotBonus: 2 },
    }),
    createTalismanFixture("stargazer-heirloom", "Stargazer Heirloom", {
      attributeBonuses: { intelligence: 5 },
    }),
    {
      ...createTalismanFixture("blue-dancer-charm", "Blue Dancer Charm"),
      calculationStatus: "catalog-only",
      effects: null,
    },
  ], {
    gameVersion: REGULATION_TEST_GAME_VERSION,
    sourceHash: REGULATION_TEST_SOURCE_HASH,
  }), saveSpellCatalog([
    spell("glintstone-pebble", "Glintstone Pebble", "sorcery", 1),
    spell("comet-azur", "Comet Azur", "sorcery", 3),
    spell("high-intelligence-spell", "High Intelligence Spell", "sorcery", 1, {
      intelligence: 75, faith: 0, arcane: 0,
    }),
  ], {
    gameVersion: REGULATION_TEST_GAME_VERSION,
    sourceHash: REGULATION_TEST_SOURCE_HASH,
  }), saveArmorCatalog([
    armor("vagabond-knight-helm", "head", 0.1, 4, 7, false),
    armor("vagabond-knight-armor", "body", 0.2, 8.3, 15, true),
    armor("other-helm", "head", 0.15, 5, 8, false),
  ], { gameVersion: REGULATION_TEST_GAME_VERSION, sourceHash: REGULATION_TEST_SOURCE_HASH }),
  saveWeaponCatalog(createRegulationWeaponCatalogFixture(), {
    gameVersion: REGULATION_TEST_GAME_VERSION,
    sourceHash: REGULATION_TEST_SOURCE_HASH,
  })]);
});

const stats = {
  vigor: 50, mind: 30, endurance: 25, strength: 12,
  dexterity: 30, intelligence: 70, faith: 9, arcane: 9,
};

describe("POST /api/builds/calculate-stats", () => {
  it("calculates aggregate build stats from supported talismans", async () => {
    const response = await request(app).post("/api/builds/calculate-stats").send({
      characterClassId: "astrologer",
      stats,
      talismanIds: ["starscourge-heirloom", "crimson-amber-medallion-plus-2"],
      armorIds: ["vagabond-knight-helm", "vagabond-knight-armor"],
      weaponIds: ["moonveil"],
    });

    expect(response.status).toBe(200);
    expect(response.body.data).toHaveLength(1);
    expect(response.body.data[0]).toMatchObject({
      stats,
      characterClass: { id: "astrologer", name: "Astrologer", startingLevel: 6 },
      characterLevel: 156,
      effectiveStats: { ...stats, vigor: 51, strength: 17 },
      resourceMultipliers: { maxHp: 0.972, maxFp: 1, maxStamina: 1, maxEquipLoad: 1 },
      fpCostMultipliers: { skill: 0.85, sorcery: 1, incantation: 1 },
      incomingDamageMultipliers: { physical: 1.1, magic: 1, fire: 1, lightning: 1, holy: 1 },
      baseResources: { maxHp: 1704, maxFp: 173, maxStamina: 121, maxEquipLoad: 72 },
      resources: { maxHp: 1656, maxFp: 173, maxStamina: 121, maxEquipLoad: 72 },
      defenses: { physical: 110, magic: 120, fire: 115, lightning: 100, holy: 120 },
      baseStatusResistances: {
        poison: 110, rot: 110, bleed: 110, frost: 110,
        sleep: 110, madness: 110, deathBlight: 110,
      },
      statusResistances: {
        poison: 130, rot: 130, bleed: 130, frost: 130,
        sleep: 130, madness: 130, deathBlight: 130,
      },
      itemDiscovery: 130,
      armorStats: {
        equipmentWeight: 12.3,
        poise: 22,
        damageNegation: { physical: 0.28 },
        hasUnresolvedPassiveEffects: true,
      },
      armor: [
        { id: "vagabond-knight-helm", name: "vagabond-knight-helm", slot: "head" },
        { id: "vagabond-knight-armor", name: "vagabond-knight-armor", slot: "body" },
      ],
      equipmentLoad: {
        currentLoad: 20.4,
        maxEquipLoad: 72,
        loadRatio: 0.283333,
        loadPercentage: 28.333333,
        category: "light",
      },
      weapons: [{ id: "moonveil", name: "Moonveil" }],
      talismans: [
        { id: "starscourge-heirloom", name: "Starscourge Heirloom" },
        { id: "crimson-amber-medallion-plus-2", name: "Crimson Amber Medallion +2" },
      ],
    });
  });

  it("returns selected catalog-only spells", async () => {
    const response = await request(app).post("/api/builds/calculate-stats").send({
      characterClassId: "astrologer", stats, talismanIds: [], armorIds: [], weaponIds: [],
      spellIds: ["glintstone-pebble"],
    });

    expect(response.status).toBe(200);
    expect(response.body.data[0].spells).toEqual([{
      id: "glintstone-pebble", name: "Glintstone Pebble", type: "sorcery",
      fpCost: 10, slotsRequired: 1,
      requirements: { intelligence: 10, faith: 0, arcane: 0 },
      calculationStatus: "catalog-only",
    }]);
    expect(response.body.data[0].memorySlots).toEqual({
      availableSlots: 2, usedSlots: 1, remainingSlots: 1,
    });
  });

  it("checks spell requirements against effective stats including talisman bonuses", async () => {
    const [withoutBonus, withBonus] = await Promise.all([
      request(app).post("/api/builds/calculate-stats").send({
        characterClassId: "astrologer", stats,
        spellIds: ["high-intelligence-spell"],
      }),
      request(app).post("/api/builds/calculate-stats").send({
        characterClassId: "astrologer", stats,
        talismanIds: ["stargazer-heirloom"],
        spellIds: ["high-intelligence-spell"],
      }),
    ]);

    expect(withoutBonus.status).toBe(400);
    expect(withoutBonus.body.data).toEqual([]);
    expect(withBonus.status).toBe(200);
    expect(withBonus.body.data[0].effectiveStats.intelligence).toBe(75);
  });

  it("calculates Regulation-backed catalyst scaling for a compatible spell", async () => {
    const response = await request(app).post("/api/builds/calculate-stats").send({
      characterClassId: "astrologer", stats,
      spellIds: ["glintstone-pebble"],
      catalyst: { weaponId: "moonveil", variantId: "moonveil", upgradeLevel: 10 },
    });

    expect(response.status).toBe(200);
    expect(response.body.data[0].catalyst).toMatchObject({
      weaponId: "moonveil",
      variantId: "moonveil",
      name: "Moonveil",
      upgradeLevel: 10,
      castingTypes: ["sorcery"],
      scaling: { magic: 197 },
    });
  });

  it("rejects incompatible catalysts and unavailable upgrade levels", async () => {
    const [incompatible, invalidUpgrade] = await Promise.all([
      request(app).post("/api/builds/calculate-stats").send({
        characterClassId: "astrologer", stats,
        spellIds: ["glintstone-pebble"],
        catalyst: { weaponId: "longsword", variantId: "longsword", upgradeLevel: 10 },
      }),
      request(app).post("/api/builds/calculate-stats").send({
        characterClassId: "astrologer", stats,
        catalyst: { weaponId: "moonveil", variantId: "moonveil", upgradeLevel: 11 },
      }),
    ]);

    expect(incompatible.status).toBe(400);
    expect(invalidUpgrade.status).toBe(400);
  });

  it("calculates memory slots from stones and talisman bonuses", async () => {
    const response = await request(app).post("/api/builds/calculate-stats").send({
      characterClassId: "astrologer", stats,
      memoryStoneCount: 1,
      talismanIds: ["moon-of-nokstella"],
      spellIds: ["comet-azur", "glintstone-pebble"],
    });

    expect(response.status).toBe(200);
    expect(response.body.data[0].memorySlots).toEqual({
      availableSlots: 5, usedSlots: 4, remainingSlots: 1,
    });
  });

  it("rejects too many occupied slots and invalid memory-stone counts", async () => {
    const [tooManySlots, invalidStoneCount] = await Promise.all([
      request(app).post("/api/builds/calculate-stats").send({
        characterClassId: "astrologer", stats, spellIds: ["comet-azur"],
      }),
      request(app).post("/api/builds/calculate-stats").send({
        characterClassId: "astrologer", stats, memoryStoneCount: 9,
      }),
    ]);

    expect(tooManySlots.status).toBe(400);
    expect(tooManySlots.body.data).toEqual([]);
    expect(invalidStoneCount.status).toBe(400);
    expect(invalidStoneCount.body.data).toEqual([]);
  });

  it("rejects unknown spells", async () => {
    const response = await request(app).post("/api/builds/calculate-stats").send({
      characterClassId: "astrologer", stats, spellIds: ["unknown-spell"],
    });
    expect(response.status).toBe(400);
    expect(response.body.data).toEqual([]);
  });

  it("rejects duplicate and catalog-only talisman selections", async () => {
    const [duplicate, unsupported] = await Promise.all([
      request(app).post("/api/builds/calculate-stats").send({
        characterClassId: "astrologer",
        stats,
        talismanIds: ["starscourge-heirloom", "starscourge-heirloom"],
      }),
      request(app).post("/api/builds/calculate-stats").send({
        characterClassId: "astrologer",
        stats,
        talismanIds: ["blue-dancer-charm"],
      }),
    ]);

    expect(duplicate.status).toBe(400);
    expect(unsupported.status).toBe(400);
    expect(duplicate.body.data).toEqual([]);
    expect(unsupported.body.data).toEqual([]);
  });

  it("rejects unknown classes and stats below their starting values", async () => {
    const [unknown, belowMinimum] = await Promise.all([
      request(app).post("/api/builds/calculate-stats").send({
        characterClassId: "unknown", stats, talismanIds: [],
      }),
      request(app).post("/api/builds/calculate-stats").send({
        characterClassId: "astrologer",
        stats: { ...stats, intelligence: 15 },
        talismanIds: [],
      }),
    ]);
    expect(unknown.status).toBe(400);
    expect(belowMinimum.status).toBe(400);
    expect(unknown.body.data).toEqual([]);
    expect(belowMinimum.body.data).toEqual([]);
  });

  it("rejects unknown armor and multiple pieces in one slot", async () => {
    const [unknown, duplicateSlot] = await Promise.all([
      request(app).post("/api/builds/calculate-stats").send({
        characterClassId: "astrologer", stats, talismanIds: [], armorIds: ["unknown"],
      }),
      request(app).post("/api/builds/calculate-stats").send({
        characterClassId: "astrologer", stats, talismanIds: [],
        armorIds: ["vagabond-knight-helm", "other-helm"],
      }),
    ]);
    expect(unknown.status).toBe(400);
    expect(duplicateSlot.status).toBe(400);
  });

  it("rejects unknown and duplicate weapon selections", async () => {
    const [unknown, duplicate] = await Promise.all([
      request(app).post("/api/builds/calculate-stats").send({
        characterClassId: "astrologer", stats, talismanIds: [], armorIds: [], weaponIds: ["unknown"],
      }),
      request(app).post("/api/builds/calculate-stats").send({
        characterClassId: "astrologer", stats, talismanIds: [], armorIds: [], weaponIds: ["moonveil", "moonveil"],
      }),
    ]);
    expect(unknown.status).toBe(400);
    expect(duplicate.status).toBe(400);
  });
});

const characterClasses = Array.from({ length: 10 }, (_, index) => ({
  id: index === 0 ? "astrologer" : `class-${index}`,
  name: index === 0 ? "Astrologer" : `Class ${index}`,
  level: index === 0 ? 6 : 1,
  stats: index === 0
    ? { vigor: 9, mind: 15, endurance: 9, strength: 8, dexterity: 12, intelligence: 16, faith: 7, arcane: 9 }
    : { vigor: 10, mind: 10, endurance: 10, strength: 10, dexterity: 10, intelligence: 10, faith: 10, arcane: 10 },
}));

function armor(id: string, slot: ArmorSlot, negation: number, weight: number, poise: number, passive: boolean): ArmorData {
  const passiveEffects = neutralArmorPassiveEffects();
  if (passive) {
    passiveEffects.attributeBonuses.vigor = 1;
    passiveEffects.resourceMultipliers.maxHp = 0.9;
    passiveEffects.fpCostMultipliers.skill = 0.85;
    passiveEffects.incomingDamageMultipliers.physical = 1.1;
  }
  return {
    id, name: id, slot, sourceProtectorId: id.length, iconId: 1, weight, poise,
    damageNegation: { physical: negation, strike: negation, slash: negation, pierce: negation, magic: negation, fire: negation, lightning: negation, holy: negation },
    resistances: { poison: 10, rot: 10, bleed: 10, frost: 10, sleep: 10, madness: 10, deathBlight: 10 },
    sourceEffectIds: passive ? [100] : [],
    hasUnresolvedPassiveEffects: passive,
    passiveEffects,
  };
}

function spell(
  id: string,
  name: string,
  type: SpellData["type"],
  slotsRequired: number,
  requirements: SpellData["requirements"] = { intelligence: 10, faith: 0, arcane: 0 },
): SpellData {
  return {
    id, sourceMagicId: id.length, name, type, fpCost: 10, slotsRequired,
    requirements, iconId: 1,
    calculationStatus: "catalog-only", attack: null,
  };
}
