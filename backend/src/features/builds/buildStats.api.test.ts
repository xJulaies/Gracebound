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
import type { ArmorData, ArmorSlot } from "../armor/domain/armor.types";
import { saveWeaponCatalog } from "../../infrastructure/regulation/services/saveWeaponCatalog";
import { createRegulationWeaponCatalogFixture } from "../../test/fixtures/regulationWeaponCatalog.fixture";

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
    {
      ...createTalismanFixture("blue-dancer-charm", "Blue Dancer Charm"),
      calculationStatus: "catalog-only",
      effects: null,
    },
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
      effectiveStats: { ...stats, strength: 17 },
      resourceMultipliers: { maxHp: 1.08, maxFp: 1, maxStamina: 1, maxEquipLoad: 1 },
      baseResources: { maxHp: 1704, maxFp: 173, maxStamina: 121, maxEquipLoad: 72 },
      resources: { maxHp: 1840, maxFp: 173, maxStamina: 121, maxEquipLoad: 72 },
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
  return {
    id, name: id, slot, sourceProtectorId: id.length, iconId: 1, weight, poise,
    damageNegation: { physical: negation, strike: negation, slash: negation, pierce: negation, magic: negation, fire: negation, lightning: negation, holy: negation },
    resistances: { poison: 10, rot: 10, bleed: 10, frost: 10, sleep: 10, madness: 10, deathBlight: 10 },
    sourceEffectIds: passive ? [100] : [],
  };
}
