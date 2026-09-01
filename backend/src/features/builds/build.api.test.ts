import type { RequestHandler } from "express";
import request from "supertest";
import { beforeEach, describe, expect, it } from "vitest";
import { createApp } from "../../app";
import { useMongoMemoryServer } from "../../test/useMongoMemoryServer";
import { BuildModel } from "./models/build.model";
import { saveWeaponCatalog } from "../../infrastructure/regulation/services/saveWeaponCatalog";
import { createRegulationWeaponCatalogFixture, REGULATION_TEST_GAME_VERSION, REGULATION_TEST_SOURCE_HASH } from "../../test/fixtures/regulationWeaponCatalog.fixture";
import { saveTalismanCatalog } from "../../infrastructure/regulation/services/saveTalismanCatalog";
import { createTalismanFixture } from "../../test/fixtures/talisman.fixture";

useMongoMemoryServer({ replicaSet: true });

beforeEach(async () => {
  await Promise.all([
    saveWeaponCatalog(createRegulationWeaponCatalogFixture(), {
      gameVersion: REGULATION_TEST_GAME_VERSION,
      sourceHash: REGULATION_TEST_SOURCE_HASH,
    }),
    saveTalismanCatalog([
      createTalismanFixture("shard-of-alexander", "Shard of Alexander"),
    ], {
      gameVersion: REGULATION_TEST_GAME_VERSION,
      sourceHash: REGULATION_TEST_SOURCE_HASH,
    }),
  ]);
});

const passThroughAuthentication: RequestHandler = (_req, _res, next) => {
  next();
};

const app = createApp({
  authenticationMiddleware: passThroughAuthentication,
  getAuthenticatedUserId: (req) => req.header("x-test-user-id") ?? null,
});

const stats = {
  vigor: 50,
  mind: 30,
  endurance: 25,
  strength: 12,
  dexterity: 30,
  intelligence: 70,
  faith: 8,
  arcane: 8,
};

function createBuildRequest() {
  return {
    name: "Moonveil Build",
    description: "Intelligence-focused build",
    level: 150,
    stats,
    equipment: {
      weaponSlots: {
        rightHand1: { weaponId: "moonveil", variantId: "moonveil", upgradeLevel: 10, ashOfWarId: null },
        rightHand2: null, rightHand3: null, leftHand1: null, leftHand2: null, leftHand3: null,
      },
      catalyst: null,
      armor: {
        headId: null,
        chestId: null,
        armsId: null,
        legsId: null,
      },
      talismanIds: ["shard-of-alexander"],
      buffSpellIds: [],
      weaponBuff: null,
    },
    visibility: "private",
  };
}

describe("protected build API", () => {
  it("rejects unauthenticated requests", async () => {
    const response = await request(app).get("/api/me/builds");

    expect(response.status).toBe(401);
    expect(response.body).toEqual({
      status: 401,
      message: "Unauthorized",
      data: [],
    });
  });

  it("creates a build for the authenticated user", async () => {
    const response = await request(app)
      .post("/api/me/builds")
      .set("x-test-user-id", "user-1")
      .send(createBuildRequest());

    expect(response.status).toBe(201);
    expect(response.body.data).toHaveLength(1);
    expect(response.body.data[0]).toMatchObject({
      name: "Moonveil Build",
      visibility: "private",
    });
    expect(response.body.data[0]).toHaveProperty("id");
    expect(response.body.data[0]).not.toHaveProperty("_id");
    expect(response.body.data[0]).not.toHaveProperty("ownerId");

    const storedBuild = await BuildModel.findOne();
    expect(storedBuild?.ownerId).toBe("user-1");
  });

  it("rejects client-controlled ownership", async () => {
    const response = await request(app)
      .post("/api/me/builds")
      .set("x-test-user-id", "user-1")
      .send({ ...createBuildRequest(), ownerId: "user-2" });

    expect(response.status).toBe(400);
    expect(await BuildModel.countDocuments()).toBe(0);
  });

  it("rejects unknown draft-build equipment references", async () => {
    const unknownWeapon = createBuildRequest();
    unknownWeapon.equipment.weaponSlots.rightHand1 = {
      weaponId: "unknown-weapon", variantId: "unknown-weapon", upgradeLevel: 10, ashOfWarId: null,
    };
    unknownWeapon.equipment.talismanIds = [];
    const weaponResponse = await request(app)
      .post("/api/me/builds")
      .set("x-test-user-id", "user-1")
      .send(unknownWeapon);

    const unknownTalisman = createBuildRequest();
    unknownTalisman.equipment.talismanIds = ["unknown-talisman"];
    const talismanResponse = await request(app)
      .post("/api/me/builds")
      .set("x-test-user-id", "user-1")
      .send(unknownTalisman);

    expect(weaponResponse.status).toBe(400);
    expect(talismanResponse.status).toBe(400);
    expect(await BuildModel.countDocuments()).toBe(0);
  });

  it("lists only builds owned by the authenticated user", async () => {
    await BuildModel.create([
      { ownerId: "user-1", name: "Owned", level: 100, stats },
      { ownerId: "user-2", name: "Foreign", level: 100, stats },
    ]);

    const response = await request(app)
      .get("/api/me/builds")
      .set("x-test-user-id", "user-1");

    expect(response.status).toBe(200);
    expect(response.body.data).toHaveLength(1);
    expect(response.body.data[0].name).toBe("Owned");
  });

  it("does not expose another user's build", async () => {
    const foreignBuild = await BuildModel.create({
      ownerId: "user-2",
      name: "Foreign",
      level: 100,
      stats,
    });

    const response = await request(app)
      .get(`/api/me/builds/${foreignBuild.id}`)
      .set("x-test-user-id", "user-1");

    expect(response.status).toBe(404);
    expect(response.body.data).toEqual([]);
  });

  it("returns an owned build", async () => {
    const build = await BuildModel.create({
      ownerId: "user-1",
      name: "Owned",
      level: 100,
      stats,
    });

    const response = await request(app)
      .get(`/api/me/builds/${build.id}`)
      .set("x-test-user-id", "user-1");

    expect(response.status).toBe(200);
    expect(response.body.data).toHaveLength(1);
    expect(response.body.data[0].name).toBe("Owned");
  });

  it("updates an owned build", async () => {
    const build = await BuildModel.create({
      ownerId: "user-1",
      name: "Original",
      level: 100,
      stats,
    });

    const response = await request(app)
      .patch(`/api/me/builds/${build.id}`)
      .set("x-test-user-id", "user-1")
      .send({ name: "Updated" });

    expect(response.status).toBe(200);
    expect(response.body.data[0].name).toBe("Updated");
  });

  it("cannot update or delete another user's build", async () => {
    const foreignBuild = await BuildModel.create({
      ownerId: "user-2",
      name: "Foreign",
      level: 100,
      stats,
    });

    const updateResponse = await request(app)
      .patch(`/api/me/builds/${foreignBuild.id}`)
      .set("x-test-user-id", "user-1")
      .send({ name: "Stolen" });
    const deleteResponse = await request(app)
      .delete(`/api/me/builds/${foreignBuild.id}`)
      .set("x-test-user-id", "user-1");

    expect(updateResponse.status).toBe(404);
    expect(deleteResponse.status).toBe(404);
    expect(await BuildModel.findById(foreignBuild.id)).not.toBeNull();
  });

  it("deletes an owned build with an empty data array", async () => {
    const build = await BuildModel.create({
      ownerId: "user-1",
      name: "Owned",
      level: 100,
      stats,
    });

    const response = await request(app)
      .delete(`/api/me/builds/${build.id}`)
      .set("x-test-user-id", "user-1");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      status: 200,
      message: "Build deleted",
      data: [],
    });
  });
});

describe("public build API", () => {
  it("lists only public builds", async () => {
    await BuildModel.create([
      {
        ownerId: "user-1",
        name: "Public",
        level: 100,
        stats,
        visibility: "public",
      },
      {
        ownerId: "user-1",
        name: "Private",
        level: 100,
        stats,
        visibility: "private",
      },
    ]);

    const response = await request(app).get("/api/builds");

    expect(response.status).toBe(200);
    expect(response.body.data).toHaveLength(1);
    expect(response.body.data[0].name).toBe("Public");
    expect(response.body.data[0]).not.toHaveProperty("ownerId");
  });

  it("returns a public build but hides a private build", async () => {
    const [publicBuild, privateBuild] = await BuildModel.create([
      {
        ownerId: "user-1",
        name: "Public",
        level: 100,
        stats,
        visibility: "public",
      },
      {
        ownerId: "user-1",
        name: "Private",
        level: 100,
        stats,
        visibility: "private",
      },
    ]);

    const publicResponse = await request(app).get(
      `/api/builds/${publicBuild.id}`,
    );
    const privateResponse = await request(app).get(
      `/api/builds/${privateBuild.id}`,
    );

    expect(publicResponse.status).toBe(200);
    expect(publicResponse.body.data[0].name).toBe("Public");
    expect(privateResponse.status).toBe(404);
  });

  it("rejects invalid build IDs", async () => {
    const response = await request(app).get("/api/builds/not-an-object-id");

    expect(response.status).toBe(400);
    expect(response.body.data).toEqual([]);
  });
});
