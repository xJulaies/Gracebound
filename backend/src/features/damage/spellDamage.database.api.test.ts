import type { RequestHandler } from "express";
import request from "supertest";
import { beforeEach, describe, expect, it } from "vitest";
import { createApp } from "../../app";
import { saveSpellCatalog } from "../../infrastructure/regulation/services/saveSpellCatalog";
import { saveWeaponCatalog } from "../../infrastructure/regulation/services/saveWeaponCatalog";
import {
  createRegulationWeaponCatalogFixture,
  REGULATION_TEST_GAME_VERSION,
  REGULATION_TEST_SOURCE_HASH,
} from "../../test/fixtures/regulationWeaponCatalog.fixture";
import { useMongoMemoryServer } from "../../test/useMongoMemoryServer";
import type { SpellData } from "../spells/domain/spell.types";
import { saveTalismanCatalog } from "../../infrastructure/regulation/services/saveTalismanCatalog";
import { createTalismanFixture } from "../../test/fixtures/talisman.fixture";
import { GreatRuneModel } from "../greatRunes/models/greatRune.model";
import { createGreatRuneRecordFixture } from "../../test/fixtures/greatRune.fixture";
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
  await Promise.all([
    saveWeaponCatalog(createRegulationWeaponCatalogFixture(), {
      gameVersion: REGULATION_TEST_GAME_VERSION,
      sourceHash: REGULATION_TEST_SOURCE_HASH,
    }),
    saveSpellCatalog([
      glintstonePebble(), greatGlintstoneShard(), comet(), catalogOnlySpell(),
      buffSpell("golden-vow", "Golden Vow", "aura", damageMultipliers(1.15)),
      buffSpell("flame-grant-me-strength", "Flame Grant Me Strength", "body", {
        physical: 1.2, magic: 1, fire: 1.2, lightning: 1, holy: 1,
      }),
      buffSpell("scholar-s-armament", "Scholar's Armament", "weapon", damageMultipliers(1)),
    ], {
      gameVersion: REGULATION_TEST_GAME_VERSION,
      sourceHash: REGULATION_TEST_SOURCE_HASH,
    }),
    saveTalismanCatalog([
      createTalismanFixture("graven-mass-talisman", "Graven-Mass Talisman", {
        spellDamageMultipliers: { sorcery: 1.08 },
      }),
      createTalismanFixture("godfrey-icon", "Godfrey Icon", {
        specializedAttackEffects: {
          chargedSpellAndSkillDamageMultipliers: damageMultipliers(1.15),
        },
      }),
      createTalismanFixture("magic-scorpion-charm", "Magic Scorpion Charm", {
        outgoingDamageMultipliers: { magic: 1.12 },
      }),
    ], {
      gameVersion: REGULATION_TEST_GAME_VERSION,
      sourceHash: REGULATION_TEST_SOURCE_HASH,
    }),
    GreatRuneModel.create([
      createGreatRuneRecordFixture("godricks-great-rune"),
      createGreatRuneRecordFixture("rykards-great-rune"),
    ]),
    CrystalTearModel.create([
      createCrystalTearRecordFixture("magic-shrouding-cracked-tear"),
      createCrystalTearRecordFixture("thorny-cracked-tear"),
      createCrystalTearRecordFixture("cerulean-hidden-tear"),
    ]),
  ]);
});

const stats = {
  strength: 12, dexterity: 30, intelligence: 70, faith: 9, arcane: 9,
};

describe("POST /api/damage/calculate spell damage", () => {
  it("applies a matching Shrouding Tear to spell damage", async () => {
    const response = await request(app).post("/api/damage/calculate").send({
      spellId: "glintstone-pebble", catalystWeaponId: "moonveil",
      catalystVariantId: "moonveil", upgradeLevel: 10, stats,
      crystalTearIds: ["magic-shrouding-cracked-tear"],
    });
    expect(response.status).toBe(200);
    expect(response.body.data[0]).toMatchObject({
      crystalTears: [{ id: "magic-shrouding-cracked-tear" }],
      offensiveOutput: { magic: 359, total: 359 },
    });
  });

  it("applies Cerulean Hidden Tear to effective spell FP cost", async () => {
    const response = await request(app).post("/api/damage/calculate").send({
      spellId: "glintstone-pebble", catalystWeaponId: "moonveil",
      catalystVariantId: "moonveil", upgradeLevel: 10, stats,
      crystalTearIds: ["cerulean-hidden-tear"],
    });
    expect(response.status).toBe(200);
    expect(response.body.data[0].attack.fpCost).toBe(0);
  });
  it("applies Godrick's Great Rune before catalyst and spell scaling", async () => {
    const response = await request(app).post("/api/damage/calculate").send({
      spellId: "glintstone-pebble",
      catalystWeaponId: "moonveil",
      catalystVariantId: "moonveil",
      upgradeLevel: 10,
      stats,
      greatRuneId: "godricks-great-rune",
    });

    expect(response.status).toBe(200);
    expect(response.body.data[0]).toMatchObject({
      effectiveStats: { strength: 17, dexterity: 35, intelligence: 75, faith: 14, arcane: 14 },
      greatRune: { id: "godricks-great-rune", name: "Godrick's Great Rune" },
    });
  });

  it("rejects a catalog-only Great Rune for spell damage", async () => {
    const response = await request(app).post("/api/damage/calculate").send({
      spellId: "glintstone-pebble",
      catalystWeaponId: "moonveil",
      catalystVariantId: "moonveil",
      upgradeLevel: 10,
      stats,
      greatRuneId: "rykards-great-rune",
    });

    expect(response.status).toBe(400);
    expect(response.body.data).toEqual([]);
  });

  it("calculates a selected spell from a saved owned build", async () => {
    const createResponse = await request(authenticatedApp)
      .post("/api/me/builds")
      .set("x-test-user-id", "user-1")
      .send({
        name: "Pebble Build", level: 150,
        stats: { vigor: 50, mind: 30, endurance: 25, ...stats },
        spellIds: ["glintstone-pebble"],
        equipment: {
          greatRuneId: "godricks-great-rune",
          catalyst: { weaponId: "moonveil", variantId: "moonveil", upgradeLevel: 10 },
        },
      });
    expect(createResponse.status).toBe(201);

    const response = await request(authenticatedApp)
      .post(`/api/me/builds/${createResponse.body.data[0].id}/calculate-damage`)
      .set("x-test-user-id", "user-1")
      .send({ spellId: "glintstone-pebble" });

    expect(response.status).toBe(200);
    expect(response.body.data[0]).toMatchObject({
      effectiveStats: { strength: 17, dexterity: 35, intelligence: 75, faith: 14, arcane: 14 },
      greatRune: { id: "godricks-great-rune", name: "Godrick's Great Rune" },
      spell: { id: "glintstone-pebble" },
      catalyst: { weaponId: "moonveil", variantId: "moonveil", upgradeLevel: 10 },
      offensiveOutput: { magic: 302, total: 302 },
    });
  });

  it("calculates the verified projectile from catalyst scaling", async () => {
    const response = await request(app).post("/api/damage/calculate").send({
      spellId: "glintstone-pebble",
      catalystWeaponId: "moonveil",
      catalystVariantId: "moonveil",
      upgradeLevel: 10,
      stats,
    });

    expect(response.status).toBe(200);
    expect(response.body.data[0]).toMatchObject({
      spell: { id: "glintstone-pebble", type: "sorcery" },
      catalyst: { weaponId: "moonveil", variantId: "moonveil", upgradeLevel: 10 },
      attackRating: { magic: 197, total: 197 },
      offensiveOutput: { magic: 299, total: 299 },
      outputUnit: "per-hit",
      components: [{ kind: "projectile", offensiveOutput: { magic: 299, total: 299 } }],
    });
  });

  it("uses each verified spell's own motion value", async () => {
    const response = await request(app).post("/api/damage/calculate").send({
      spellId: "great-glintstone-shard",
      catalystWeaponId: "moonveil",
      catalystVariantId: "moonveil",
      upgradeLevel: 10,
      stats,
    });

    expect(response.status).toBe(200);
    expect(response.body.data[0].offensiveOutput).toMatchObject({ magic: 415, total: 415 });
  });

  it("selects the verified charged projectile profile", async () => {
    const [normal, charged] = await Promise.all([
      request(app).post("/api/damage/calculate").send({
        spellId: "comet", catalystWeaponId: "moonveil", catalystVariantId: "moonveil",
        upgradeLevel: 10, stats,
      }),
      request(app).post("/api/damage/calculate").send({
        spellId: "comet", catalystWeaponId: "moonveil", catalystVariantId: "moonveil",
        upgradeLevel: 10, stats, charged: true,
      }),
    ]);

    expect(normal.status).toBe(200);
    expect(charged.status).toBe(200);
    expect(normal.body.data[0].offensiveOutput.magic).toBe(575);
    expect(charged.body.data[0]).toMatchObject({
      spell: { id: "comet", charged: true },
      attack: { id: "comet-charged", fpCost: 24 },
      offensiveOutput: { magic: 719, total: 719 },
    });
  });

  it("rejects charged mode for a spell without a charged profile", async () => {
    const response = await request(app).post("/api/damage/calculate").send({
      spellId: "glintstone-pebble", catalystWeaponId: "moonveil",
      catalystVariantId: "moonveil", upgradeLevel: 10, stats, charged: true,
    });
    expect(response.status).toBe(400);
  });

  it("combines spell-type, damage-type, and charged talisman multipliers", async () => {
    const response = await request(app).post("/api/damage/calculate").send({
      spellId: "comet", catalystWeaponId: "moonveil", catalystVariantId: "moonveil",
      upgradeLevel: 10, stats, charged: true,
      talismanIds: ["graven-mass-talisman", "godfrey-icon", "magic-scorpion-charm"],
    });

    expect(response.status).toBe(200);
    expect(response.body.data[0]).toMatchObject({
      talismans: [
        { id: "graven-mass-talisman" }, { id: "godfrey-icon" },
        { id: "magic-scorpion-charm" },
      ],
      offensiveOutput: { magic: 1000, total: 1000 },
    });
  });

  it("rejects catalog-only spells and incompatible catalysts", async () => {
    const [unsupported, incompatible] = await Promise.all([
      request(app).post("/api/damage/calculate").send({
        spellId: "catalog-spell", catalystWeaponId: "moonveil",
        catalystVariantId: "moonveil", upgradeLevel: 10, stats,
      }),
      request(app).post("/api/damage/calculate").send({
        spellId: "glintstone-pebble", catalystWeaponId: "longsword",
        catalystVariantId: "longsword", upgradeLevel: 10, stats,
      }),
    ]);

    expect(unsupported.status).toBe(400);
    expect(incompatible.status).toBe(400);
  });

  it("combines one verified aura and body buff", async () => {
    const response = await request(app).post("/api/damage/calculate").send({
      spellId: "comet", catalystWeaponId: "moonveil", catalystVariantId: "moonveil",
      upgradeLevel: 10, stats,
      buffSpellIds: ["golden-vow", "flame-grant-me-strength"],
    });
    expect(response.status).toBe(200);
    expect(response.body.data[0]).toMatchObject({
      buffs: [
        { id: "golden-vow", slot: "aura", durationSeconds: 80 },
        { id: "flame-grant-me-strength", slot: "body", durationSeconds: 30 },
      ],
      offensiveOutput: { magic: 661, total: 661 },
    });
  });

  it("rejects weapon buffs without catalyst configuration", async () => {
    const response = await request(app).post("/api/damage/calculate").send({
      spellId: "comet", catalystWeaponId: "moonveil", catalystVariantId: "moonveil",
      upgradeLevel: 10, stats, buffSpellIds: ["scholar-s-armament"],
    });
    expect(response.status).toBe(400);
  });
});

function glintstonePebble(): SpellData {
  return {
    id: "glintstone-pebble", sourceMagicId: 4000, name: "Glintstone Pebble",
    type: "sorcery", schools: ["glintstone"], fpCost: 7, chargedFpCost: null, sustainedFpCost: null, slotsRequired: 1,
    requirements: { intelligence: 10, faith: 0, arcane: 0 }, iconId: 4000,
    calculationStatus: "supported",
    buffEffect: null,
    attack: {
      id: "glintstone-pebble-hit",
      label: "Hit",
      outputUnit: "per-hit",
      sourceBulletId: 10400000, sourceAttackId: 40000,
      motionValues: { physical: 0, magic: 152, fire: 0, lightning: 0, holy: 0 },
      finalDamageRates: { physical: 1, magic: 1, fire: 1, lightning: 1, holy: 1 },
      statusBuildup: emptyStatusBuildup(),
      additionalComponents: [],
    },
    chargedAttack: null,
  };
}

function catalogOnlySpell(): SpellData {
  return {
    ...glintstonePebble(), id: "catalog-spell", name: "Catalog Spell",
    calculationStatus: "catalog-only", attack: null,
  };
}

function greatGlintstoneShard(): SpellData {
  const spell = glintstonePebble();
  return {
    ...spell,
    id: "great-glintstone-shard",
    sourceMagicId: 4001,
    name: "Great Glintstone Shard",
    fpCost: 12,
    attack: {
      ...spell.attack!,
      sourceBulletId: 10400100,
      sourceAttackId: 40010,
      motionValues: { physical: 0, magic: 211, fire: 0, lightning: 0, holy: 0 },
    },
  };
}

function comet(): SpellData {
  const spell = glintstonePebble();
  return {
    ...spell,
    id: "comet", sourceMagicId: 4021, name: "Comet", fpCost: 24, chargedFpCost: 24,
    requirements: { intelligence: 52, faith: 0, arcane: 0 },
    attack: {
      ...spell.attack!, sourceBulletId: 10402100, sourceAttackId: 40210,
      motionValues: { physical: 0, magic: 292, fire: 0, lightning: 0, holy: 0 },
    },
    chargedAttack: {
      ...spell.attack!, sourceBulletId: 10402150, sourceAttackId: 40211,
      motionValues: { physical: 0, magic: 365, fire: 0, lightning: 0, holy: 0 },
    },
  };
}

function damageMultipliers(value: number) {
  return { physical: value, magic: value, fire: value, lightning: value, holy: value };
}

function buffSpell(
  id: string,
  name: string,
  slot: "aura" | "body" | "weapon",
  outgoingDamageMultipliers: ReturnType<typeof damageMultipliers>,
): SpellData {
  return {
    ...catalogOnlySpell(), id, name, sourceMagicId: id.length,
    calculationStatus: "supported",
    buffEffect: {
      slot, durationSeconds: slot === "aura" ? 80 : slot === "body" ? 30 : 90,
      outgoingDamageMultipliers,
      weaponAddedDamageScaling: {
        physical: 0, magic: slot === "weapon" ? 0.75 : 0,
        fire: 0, lightning: 0, holy: 0,
      },
      weaponAddedStatusBuildup: emptyStatusBuildup(),
      limitations: [],
    },
  };
}

function emptyStatusBuildup() {
  return { poison: 0, rot: 0, bleed: 0, frost: 0, sleep: 0, madness: 0, deathBlight: 0 };
}
