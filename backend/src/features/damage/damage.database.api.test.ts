import type { RequestHandler } from "express";
import request from "supertest";
import { beforeEach, describe, expect, it } from "vitest";
import { createApp } from "../../app";
import { saveWeaponDataSet } from "../../infrastructure/erdb/services/saveWeaponDataSet";
import { useMongoMemoryServer } from "../../test/useMongoMemoryServer";
import { weaponFixtures } from "../weapons/data/weapon.fixtures";
import { ReinforcementModel } from "../weapons/models/reinforcement.model";
import { ScalingCurveModel } from "../weapons/models/scalingCurve.model";
import { WeaponModel } from "../weapons/models/weapon.model";

const passThroughAuthentication: RequestHandler = (_req, _res, next) => {
  next();
};

const app = createApp({
  authenticationMiddleware: passThroughAuthentication,
  getAuthenticatedUserId: () => null,
});

useMongoMemoryServer({ replicaSet: true });

beforeEach(async () => {
  await saveWeaponDataSet(structuredClone(weaponFixtures));
});

function createWeaponDamageRequest(weaponId = "moonveil", upgradeLevel = 10) {
  return {
    weaponId,
    upgradeLevel,
    stats: {
      strength: 12,
      dexterity: 30,
      intelligence: 70,
      faith: 8,
      arcane: 8,
    },
    target: {
      defense: { physical: 100, magic: 100, fire: 100, lightning: 100, holy: 100 },
      absorption: {
        physical: { standard: 20, slash: 20, strike: 20, pierce: 20 },
        magic: 40,
        fire: 0,
        lightning: 0,
        holy: 0,
      },
    },
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
        gameVersion: "1.10.0",
        upgradeLevel: 10,
      },
      attackRating: {
        physical: 251,
        magic: 420,
        total: 671,
      },
    });
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
      WeaponModel.deleteMany({}),
      ReinforcementModel.deleteMany({}),
      ScalingCurveModel.deleteMany({}),
    ]);

    const olderDataSet = structuredClone(weaponFixtures);
    Object.values(olderDataSet.weapons).forEach((weapon) => {
      weapon.gameVersion = "1.09.0";
    });
    await saveWeaponDataSet(olderDataSet);

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
