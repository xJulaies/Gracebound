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

const passThroughAuthentication: RequestHandler = (_request, _response, next) => next();
const app = createApp({
  authenticationMiddleware: passThroughAuthentication,
  getAuthenticatedUserId: () => null,
});

useMongoMemoryServer({ replicaSet: true });

beforeEach(async () => {
  await Promise.all([
    saveWeaponCatalog(createRegulationWeaponCatalogFixture(), {
      gameVersion: REGULATION_TEST_GAME_VERSION,
      sourceHash: REGULATION_TEST_SOURCE_HASH,
    }),
    saveSpellCatalog([glintstonePebble(), greatGlintstoneShard(), catalogOnlySpell()], {
      gameVersion: REGULATION_TEST_GAME_VERSION,
      sourceHash: REGULATION_TEST_SOURCE_HASH,
    }),
  ]);
});

const stats = {
  strength: 12, dexterity: 30, intelligence: 70, faith: 9, arcane: 9,
};

describe("POST /api/damage/calculate spell damage", () => {
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
});

function glintstonePebble(): SpellData {
  return {
    id: "glintstone-pebble", sourceMagicId: 4000, name: "Glintstone Pebble",
    type: "sorcery", fpCost: 7, slotsRequired: 1,
    requirements: { intelligence: 10, faith: 0, arcane: 0 }, iconId: 4000,
    calculationStatus: "supported",
    attack: {
      sourceBulletId: 10400000, sourceAttackId: 40000,
      motionValues: { physical: 0, magic: 152, fire: 0, lightning: 0, holy: 0 },
      finalDamageRates: { physical: 1, magic: 1, fire: 1, lightning: 1, holy: 1 },
    },
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
