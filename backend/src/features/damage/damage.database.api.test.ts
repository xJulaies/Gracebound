import type { RequestHandler } from "express";
import request from "supertest";
import { beforeEach, describe, expect, it } from "vitest";
import { createApp } from "../../app";
import type { BossData } from "../bosses/domain/boss.types";
import { saveBossDataSet } from "../../infrastructure/regulation/services/saveBossDataSet";
import { saveWeaponCatalog } from "../../infrastructure/regulation/services/saveWeaponCatalog";
import {
  createRegulationWeaponCatalogFixture,
  REGULATION_TEST_GAME_VERSION,
  REGULATION_TEST_SOURCE_HASH,
} from "../../test/fixtures/regulationWeaponCatalog.fixture";
import { useMongoMemoryServer } from "../../test/useMongoMemoryServer";
import { ReinforcementModel } from "../weapons/models/reinforcement.model";
import { ScalingCurveModel } from "../weapons/models/scalingCurve.model";
import { WeaponVariantModel } from "../weapons/models/weapon.model";
import { WeaponCatalogModel } from "../weapons/models/weaponCatalog.model";
import { BossModel } from "../bosses/models/boss.model";

const passThroughAuthentication: RequestHandler = (_req, _res, next) => {
  next();
};

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
    saveBossDataSet([boss], {
      gameVersion: REGULATION_TEST_GAME_VERSION,
      sourceHash: REGULATION_TEST_SOURCE_HASH,
    }),
  ]);
});

const boss: BossData = {
  id: "test-boss",
  name: "Test Boss",
  health: 1000,
  defense: { physical: 100, magic: 100, fire: 100, lightning: 100, holy: 100 },
  absorption: {
    physical: { standard: 20, slash: 20, strike: 20, pierce: 20 },
    magic: 40,
    fire: 0,
    lightning: 0,
    holy: 0,
  },
  sourceNpcId: 1,
  healthScalingEffectId: 1,
};

function createWeaponDamageRequest(
  weaponId = "moonveil",
  upgradeLevel = 10,
  bossId?: string,
  attackId = "katana-1h-heavy-1",
) {
  return {
    weaponId,
    upgradeLevel,
    attackId,
    stats: {
      strength: 12,
      dexterity: 30,
      intelligence: 70,
      faith: 8,
      arcane: 8,
    },
    ...(bossId ? { bossId } : {}),
  };
}

function createWeaponSkillDamageRequest(
  weaponId = "moonveil",
  skillAttackId = "transient-moonlight-light",
  bossId?: string,
) {
  return {
    weaponId,
    upgradeLevel: 10,
    skillAttackId,
    stats: {
      strength: 12,
      dexterity: 30,
      intelligence: 70,
      faith: 8,
      arcane: 8,
    },
    ...(bossId ? { bossId } : {}),
  };
}

describe("POST /api/damage/calculate with MongoDB weapon data", () => {
  it("calculates attack rating from the active game version", async () => {
    const response = await request(app)
      .post("/api/damage/calculate")
      .send(createWeaponDamageRequest());

    expect(response.status).toBe(200);
    expect(response.body.data[0]).toMatchObject({
      weapon: {
        id: "moonveil",
        name: "Moonveil",
        gameVersion: REGULATION_TEST_GAME_VERSION,
        upgradeLevel: 10,
      },
      attack: {
        id: "katana-1h-heavy-1",
        name: "One-handed heavy attack 1",
      },
      attackRating: {
        physical: 251,
        magic: 420,
        total: 671,
      },
      offensiveOutput: {
        physical: 313,
        magic: 525,
        total: 838,
      },
    });
    expect(response.body.data[0]).not.toHaveProperty("damage");
  });

  it("loads a selected boss and calculates damage against it", async () => {
    const response = await request(app)
      .post("/api/damage/calculate")
      .send(createWeaponDamageRequest("moonveil", 10, "test-boss"));

    expect(response.status).toBe(200);
    expect(response.body.data[0]).toMatchObject({
      target: { id: "test-boss", name: "Test Boss" },
      damage: { physical: 186, magic: 267, total: 453 },
    });
  });

  it("calculates a stored multi-component skill attack", async () => {
    const response = await request(app)
      .post("/api/damage/calculate")
      .send(createWeaponSkillDamageRequest());

    expect(response.status).toBe(200);
    expect(response.body.data[0]).toMatchObject({
      weapon: { id: "moonveil", name: "Moonveil" },
      attack: {
        id: "transient-moonlight-light",
        name: "Transient Moonlight (Light)",
        fpCost: 15,
      },
      components: [
        {
          kind: "projectile",
          offensiveOutput: { physical: 0, magic: 91, total: 91 },
        },
        {
          kind: "weapon-hit",
          offensiveOutput: { physical: 100, magic: 168, total: 268 },
        },
      ],
      offensiveOutput: { physical: 100, magic: 259, total: 359 },
    });
    expect(response.body.data[0]).not.toHaveProperty("damage");
  });

  it("calculates a stored skill attack against a selected boss", async () => {
    const response = await request(app)
      .post("/api/damage/calculate")
      .send(createWeaponSkillDamageRequest("moonveil", "transient-moonlight-light", "test-boss"));

    expect(response.status).toBe(200);
    expect(response.body.data[0]).toMatchObject({
      target: { id: "test-boss", name: "Test Boss" },
      damage: expect.objectContaining({ total: expect.any(Number) }),
    });
  });

  it("calculates a Straight Sword class attack without a boss", async () => {
    const response = await request(app)
      .post("/api/damage/calculate")
      .send(
        createWeaponDamageRequest(
          "longsword",
          10,
          undefined,
          "straight-sword-1h-light-1",
        ),
      );

    expect(response.status).toBe(200);
    expect(response.body.data[0]).toMatchObject({
      weapon: { id: "longsword", name: "Longsword" },
      attack: {
        id: "straight-sword-1h-light-1",
        name: "One-handed light attack 1",
      },
      attackRating: { physical: 251, magic: 420, total: 671 },
      offensiveOutput: { physical: 251, magic: 420, total: 671 },
    });
    expect(response.body.data[0]).not.toHaveProperty("damage");
  });

  it("uses a weapon-specific attack override", async () => {
    const response = await request(app)
      .post("/api/damage/calculate")
      .send(createWeaponDamageRequest("serpentbone-blade"));

    expect(response.status).toBe(200);
    expect(response.body.data[0]).toMatchObject({
      weapon: { id: "serpentbone-blade", name: "Serpentbone Blade" },
      attack: { id: "katana-1h-heavy-1" },
      attackRating: { physical: 251, magic: 420, total: 671 },
      offensiveOutput: { physical: 125, magic: 210, total: 335 },
    });
  });

  it("returns not found for an unsupported weapon attack", async () => {
    const response = await request(app)
      .post("/api/damage/calculate")
      .send(
        createWeaponDamageRequest(
          "moonveil",
          10,
          undefined,
          "unknown-attack",
        ),
      );

    expect(response.status).toBe(404);
    expect(response.body.data).toEqual([]);
  });

  it("rejects a valid attack that belongs to another weapon", async () => {
    const response = await request(app)
      .post("/api/damage/calculate")
      .send(
        createWeaponDamageRequest(
          "moonveil",
          10,
          undefined,
          "straight-sword-1h-light-1",
        ),
      );

    expect(response.status).toBe(404);
    expect(response.body.data).toEqual([]);
  });

  it("rejects a skill attack that does not belong to the selected weapon", async () => {
    const response = await request(app)
      .post("/api/damage/calculate")
      .send(createWeaponSkillDamageRequest("longsword"));

    expect(response.status).toBe(404);
    expect(response.body.data).toEqual([]);
  });

  it("rejects requests containing both normal and skill attack IDs", async () => {
    const response = await request(app)
      .post("/api/damage/calculate")
      .send({
        ...createWeaponDamageRequest(),
        skillAttackId: "transient-moonlight-light",
      });

    expect(response.status).toBe(400);
    expect(response.body.data).toEqual([]);
  });

  it("returns not found for an unknown boss", async () => {
    const response = await request(app)
      .post("/api/damage/calculate")
      .send(createWeaponDamageRequest("moonveil", 10, "unknown-boss"));

    expect(response.status).toBe(404);
    expect(response.body.data).toEqual([]);
  });

  it("does not use boss data from another game version", async () => {
    await BossModel.deleteMany({});
    await saveBossDataSet([boss], {
      gameVersion: "1.15.0",
      sourceHash: REGULATION_TEST_SOURCE_HASH,
    });

    const response = await request(app)
      .post("/api/damage/calculate")
      .send(createWeaponDamageRequest("moonveil", 10, "test-boss"));

    expect(response.status).toBe(404);
    expect(response.body.data).toEqual([]);
  });

  it("returns not found for an unknown weapon", async () => {
    const response = await request(app)
      .post("/api/damage/calculate")
      .send(createWeaponDamageRequest("unknown-weapon", 0));

    expect(response.status).toBe(404);
    expect(response.body.data).toEqual([]);
  });

  it("does not use weapon data from another game version", async () => {
    await Promise.all([
      WeaponCatalogModel.deleteMany({}),
      WeaponVariantModel.deleteMany({}),
      ReinforcementModel.deleteMany({}),
      ScalingCurveModel.deleteMany({}),
    ]);

    const olderDataSet = createRegulationWeaponCatalogFixture();
    Object.values(olderDataSet.calculationData.weapons).forEach((weapon) => {
      weapon.gameVersion = "1.15.0";
    });
    await saveWeaponCatalog(olderDataSet, {
      gameVersion: "1.15.0",
      sourceHash: REGULATION_TEST_SOURCE_HASH,
    });

    const response = await request(app)
      .post("/api/damage/calculate")
      .send(createWeaponDamageRequest());

    expect(response.status).toBe(404);
    expect(response.body.data).toEqual([]);
  });

  it("rejects an unsupported upgrade level", async () => {
    const response = await request(app)
      .post("/api/damage/calculate")
      .send(createWeaponDamageRequest("moonveil", 25));

    expect(response.status).toBe(400);
    expect(response.body.data).toEqual([]);
  });
});
