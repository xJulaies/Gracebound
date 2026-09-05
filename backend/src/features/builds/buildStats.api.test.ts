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
import { saveGreatRuneCatalog } from "../../infrastructure/regulation/services/saveGreatRuneCatalog";
import type { GreatRuneData } from "../greatRunes/domain/greatRune.types";
import { CrystalTearModel } from "../crystalTears/models/crystalTear.model";
import { createCrystalTearRecordFixture } from "../../test/fixtures/crystalTear.fixture";

const passThroughAuthentication: RequestHandler = (_request, _response, next) => next();
const app = createApp({
  authenticationMiddleware: passThroughAuthentication,
  getAuthenticatedUserId: () => null,
});
const authenticatedApp = createApp({
  authenticationMiddleware: passThroughAuthentication,
  getAuthenticatedUserId: (request) => request.header("x-test-user-id") ?? null,
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
  }), saveGreatRuneCatalog(greatRunes, {
    gameVersion: REGULATION_TEST_GAME_VERSION,
    sourceHash: REGULATION_TEST_SOURCE_HASH,
  }), CrystalTearModel.create([
    createCrystalTearRecordFixture("crimsonspill-crystal-tear"),
    createCrystalTearRecordFixture("strength-knot-crystal-tear"),
    createCrystalTearRecordFixture("thorny-cracked-tear"),
    createCrystalTearRecordFixture("opaline-hardtear"),
    createCrystalTearRecordFixture("cerulean-hidden-tear"),
    createCrystalTearRecordFixture("greenburst-crystal-tear"),
    createCrystalTearRecordFixture("winged-crystal-tear"),
    createCrystalTearRecordFixture("speckled-hardtear"),
    createCrystalTearRecordFixture("crimson-crystal-tear-1"),
    createCrystalTearRecordFixture("crimson-crystal-tear-2"),
    createCrystalTearRecordFixture("cerulean-crystal-tear-1"),
    createCrystalTearRecordFixture("crimsonburst-crystal-tear"),
  ])]);
});

const stats = {
  vigor: 50, mind: 30, endurance: 25, strength: 12,
  dexterity: 30, intelligence: 70, faith: 9, arcane: 9,
};

describe("saved build catalog validation", () => {
  it("persists a valid character class and spell loadout", async () => {
    const response = await request(authenticatedApp)
      .post("/api/me/builds")
      .set("x-test-user-id", "user-1")
      .send({
        name: "Astrologer Spells",
        characterClassId: "astrologer",
        level: 156,
        stats,
        memoryStoneCount: 1,
        spellIds: ["glintstone-pebble"],
        equipment: {
          greatRuneId: "godricks-great-rune",
          crystalTearIds: ["strength-knot-crystal-tear"],
          weaponSlots: {
            rightHand1: { weaponId: "moonveil", variantId: "moonveil", upgradeLevel: 10 },
          },
        },
      });

    expect(response.status).toBe(201);
    expect(response.body.data[0]).toMatchObject({
      characterClassId: "astrologer",
      level: 156,
      memoryStoneCount: 1,
      spellIds: ["glintstone-pebble"],
      equipment: {
        greatRuneId: "godricks-great-rune",
        crystalTearIds: ["strength-knot-crystal-tear"],
      },
    });
  });

  it("rejects a level that does not match class and attributes", async () => {
    const response = await request(authenticatedApp)
      .post("/api/me/builds")
      .set("x-test-user-id", "user-1")
      .send({
        name: "Invalid Level", characterClassId: "astrologer",
        level: 150, stats,
      });

    expect(response.status).toBe(400);
  });
});

describe("POST /api/builds/calculate-stats", () => {
  it("combines two supported Crystal Tears in the Physick", async () => {
    const response = await request(app).post("/api/builds/calculate-stats").send({
      characterClassId: "astrologer", stats,
      crystalTearIds: ["strength-knot-crystal-tear", "crimsonspill-crystal-tear"],
    });
    expect(response.status).toBe(200);
    expect(response.body.data[0]).toMatchObject({
      effectiveStats: { strength: 22 },
      resourceMultipliers: { maxHp: 1.1 },
      resources: { maxHp: 1874 },
      crystalTears: [
        { id: "strength-knot-crystal-tear" }, { id: "crimsonspill-crystal-tear" },
      ],
    });
  });

  it("rejects catalog-only Crystal Tears", async () => {
    const response = await request(app).post("/api/builds/calculate-stats").send({
      characterClassId: "astrologer", stats, crystalTearIds: ["thorny-cracked-tear"],
    });
    expect(response.status).toBe(400);
  });

  it("exposes supported defensive and FP-cost Physick effects", async () => {
    const response = await request(app).post("/api/builds/calculate-stats").send({
      characterClassId: "astrologer", stats,
      crystalTearIds: ["opaline-hardtear", "cerulean-hidden-tear"],
    });
    expect(response.status).toBe(200);
    expect(response.body.data[0]).toMatchObject({
      incomingDamageMultipliers: { physical: 0.85, magic: 0.85, fire: 0.85, lightning: 0.85, holy: 0.85 },
      fpCostMultipliers: { skill: 0, sorcery: 0, incantation: 0 },
    });
  });

  it("applies recovery, equip-load, resistance, and cleanse Physick effects", async () => {
    const [utility, speckled] = await Promise.all([
      request(app).post("/api/builds/calculate-stats").send({
        characterClassId: "astrologer", stats,
        crystalTearIds: ["greenburst-crystal-tear", "winged-crystal-tear"],
      }),
      request(app).post("/api/builds/calculate-stats").send({
        characterClassId: "astrologer", stats, crystalTearIds: ["speckled-hardtear"],
      }),
    ]);
    expect(utility.status).toBe(200);
    expect(utility.body.data[0]).toMatchObject({
      staminaRecoverySpeedBonus: 15,
      resources: { maxEquipLoad: 324 },
    });
    expect(speckled.status).toBe(200);
    expect(speckled.body.data[0].statusResistances).toMatchObject({ poison: 200, rot: 200, bleed: 200, frost: 200, sleep: 200, madness: 200, deathBlight: 200 });
    expect(speckled.body.data[0].cleansesStatusBuildup).toEqual(["poison", "rot", "bleed", "frost", "sleep", "madness", "deathBlight"]);
  });

  it("reports immediate and timed Physick recovery separately", async () => {
    const [instant, regeneration] = await Promise.all([
      request(app).post("/api/builds/calculate-stats").send({
        characterClassId: "astrologer", stats,
        crystalTearIds: ["crimson-crystal-tear-1", "crimson-crystal-tear-2"],
      }),
      request(app).post("/api/builds/calculate-stats").send({
        characterClassId: "astrologer", stats,
        crystalTearIds: ["cerulean-crystal-tear-1", "crimsonburst-crystal-tear"],
      }),
    ]);
    expect(instant.status).toBe(200);
    expect(instant.body.data[0].physickRecovery).toMatchObject({ instantMaxHpPercent: 1 });
    expect(regeneration.status).toBe(200);
    expect(regeneration.body.data[0].physickRecovery).toEqual({
      instantMaxHpPercent: 0,
      instantMaxFpPercent: 0.5,
      hpPerSecond: 7,
      hpRegenerationDurationSeconds: 180,
    });
  });
  it("applies supported Great Rune attributes before curves and resources afterward", async () => {
    const [godrick, radahn] = await Promise.all([
      request(app).post("/api/builds/calculate-stats").send({
        characterClassId: "astrologer",
        stats,
        greatRuneId: "godricks-great-rune",
      }),
      request(app).post("/api/builds/calculate-stats").send({
        characterClassId: "astrologer",
        stats,
        greatRuneId: "radahns-great-rune",
      }),
    ]);

    expect(godrick.status).toBe(200);
    expect(godrick.body.data[0]).toMatchObject({
      effectiveStats: {
        vigor: 55, mind: 35, endurance: 30, strength: 17,
        dexterity: 35, intelligence: 75, faith: 14, arcane: 14,
      },
      greatRune: { id: "godricks-great-rune", name: "Godrick's Great Rune" },
    });
    expect(radahn.status).toBe(200);
    expect(radahn.body.data[0]).toMatchObject({
      effectiveStats: stats,
      resourceMultipliers: {
        maxHp: 1.15, maxFp: 1.15, maxStamina: 1.15, maxEquipLoad: 1,
      },
      resources: { maxHp: 1959, maxFp: 198, maxStamina: 139, maxEquipLoad: 72 },
      greatRune: { id: "radahns-great-rune", name: "Radahn's Great Rune" },
    });
  });

  it("rejects unknown and catalog-only Great Runes", async () => {
    const [unknown, unsupported] = await Promise.all([
      request(app).post("/api/builds/calculate-stats").send({
        characterClassId: "astrologer", stats, greatRuneId: "unknown-rune",
      }),
      request(app).post("/api/builds/calculate-stats").send({
        characterClassId: "astrologer", stats, greatRuneId: "rykards-great-rune",
      }),
    ]);

    expect(unknown.status).toBe(400);
    expect(unknown.body.data).toEqual([]);
    expect(unsupported.status).toBe(400);
    expect(unsupported.body.data).toEqual([]);
  });

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
      nextLevelRuneCost: 168_508,
      totalRuneCost: 8_067_647,
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
      damageNegation: {
        physical: 0.208,
        strike: 0.208,
        slash: 0.208,
        pierce: 0.208,
        magic: 0.28,
        fire: 0.28,
        lightning: 0.28,
        holy: 0.28,
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

  it("rejects unknown and accepts duplicate weapon selections", async () => {
    const [unknown, duplicate] = await Promise.all([
      request(app).post("/api/builds/calculate-stats").send({
        characterClassId: "astrologer", stats, talismanIds: [], armorIds: [], weaponIds: ["unknown"],
      }),
      request(app).post("/api/builds/calculate-stats").send({
        characterClassId: "astrologer", stats, talismanIds: [], armorIds: [], weaponIds: ["moonveil", "moonveil"],
      }),
    ]);
    expect(unknown.status).toBe(400);
    expect(duplicate.status).toBe(200);
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

const greatRunesByName = [
  "Godrick's Great Rune", "Radahn's Great Rune", "Morgott's Great Rune",
  "Rykard's Great Rune", "Mohg's Great Rune", "Malenia's Great Rune",
  "Great Rune of the Unborn",
];

const greatRunes: GreatRuneData[] = [
  greatRune("godricks-great-rune", "Godrick's Great Rune", {
    attributeBonuses: {
      vigor: 5, mind: 5, endurance: 5, strength: 5,
      dexterity: 5, intelligence: 5, faith: 5, arcane: 5,
    },
    resourceMultipliers: { maxHp: 1, maxFp: 1, maxStamina: 1 },
  }),
  greatRune("radahns-great-rune", "Radahn's Great Rune", {
    attributeBonuses: neutralStats(),
    resourceMultipliers: { maxHp: 1.15, maxFp: 1.15, maxStamina: 1.15 },
  }),
  greatRune("morgotts-great-rune", "Morgott's Great Rune", {
    attributeBonuses: neutralStats(),
    resourceMultipliers: { maxHp: 1.25, maxFp: 1, maxStamina: 1 },
  }),
  greatRune("rykards-great-rune", "Rykard's Great Rune", null),
  greatRune("mohgs-great-rune", "Mohg's Great Rune", null),
  greatRune("malenias-great-rune", "Malenia's Great Rune", null),
  greatRune("great-rune-of-the-unborn", "Great Rune of the Unborn", null),
];

function greatRune(
  id: string,
  name: string,
  effects: GreatRuneData["effects"],
): GreatRuneData {
  const index = greatRunesByName.indexOf(name);
  return {
    id,
    name,
    sourceGoodsId: index === 6 ? 10080 : 191 + index,
    sourceEffectId: effects ? 600 + index * 10 : null,
    iconId: 3200 + index,
    activation: index === 6 ? "not-applicable" : "rune-arc",
    calculationStatus: effects ? "supported" : "catalog-only",
    effects,
    limitations: effects ? [] : ["Requires unsupported state."],
  };
}

function neutralStats() {
  return {
    vigor: 0, mind: 0, endurance: 0, strength: 0,
    dexterity: 0, intelligence: 0, faith: 0, arcane: 0,
  };
}

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
    id, sourceMagicId: id.length, name, type, schools: [], fpCost: 10, slotsRequired,
    requirements, iconId: 1,
    calculationStatus: "catalog-only", buffEffect: null, attack: null,
    chargedFpCost: null, sustainedFpCost: null, chargedAttack: null,
  };
}
