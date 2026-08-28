import type { RequestHandler } from "express";
import request from "supertest";
import { beforeEach, describe, expect, it } from "vitest";
import { createApp } from "../../app";
import { saveWeaponCatalog } from "../../infrastructure/regulation/services/saveWeaponCatalog";
import {
  createRegulationWeaponCatalogFixture,
  REGULATION_TEST_GAME_VERSION,
  REGULATION_TEST_SOURCE_HASH,
} from "../../test/fixtures/regulationWeaponCatalog.fixture";
import { useMongoMemoryServer } from "../../test/useMongoMemoryServer";

const passThroughAuthentication: RequestHandler = (_request, _response, next) => {
  next();
};

const app = createApp({
  authenticationMiddleware: passThroughAuthentication,
  getAuthenticatedUserId: () => null,
});

useMongoMemoryServer({ replicaSet: true });

beforeEach(async () => {
  await saveWeaponCatalog(createRegulationWeaponCatalogFixture(), {
    gameVersion: REGULATION_TEST_GAME_VERSION,
    sourceHash: REGULATION_TEST_SOURCE_HASH,
  });
});

describe("public weapon API", () => {
  it("returns a paginated list without internal persistence fields", async () => {
    const response = await request(app).get("/api/weapons?limit=1");

    expect(response.status).toBe(200);
    expect(response.headers["x-total-count"]).toBe("2");
    expect(response.body.data).toHaveLength(1);
    expect(response.body.data[0]).toMatchObject({
      id: "grafted-blade-greatsword",
      name: "Grafted Blade Greatsword",
      gameVersion: REGULATION_TEST_GAME_VERSION,
      variants: [
        { id: "grafted-blade-greatsword", affinity: "standard" },
      ],
    });
    expect(response.body.data[0]).not.toHaveProperty("_id");
    expect(response.body.data[0]).not.toHaveProperty("sourceHash");
    expect(response.body.data[0].variants[0]).not.toHaveProperty("sourceId");
  });

  it("searches weapons by name", async () => {
    const response = await request(app).get("/api/weapons?search=moon");

    expect(response.status).toBe(200);
    expect(response.body.data.map(({ id }: { id: string }) => id)).toEqual([
      "moonveil",
    ]);
  });

  it("returns an empty array when no weapon matches", async () => {
    const response = await request(app).get("/api/weapons?search=missing");

    expect(response.status).toBe(200);
    expect(response.headers["x-total-count"]).toBe("0");
    expect(response.body.data).toEqual([]);
  });

  it("returns one weapon by its stable ID", async () => {
    const response = await request(app).get("/api/weapons/moonveil");

    expect(response.status).toBe(200);
    expect(response.body.data).toHaveLength(1);
    expect(response.body.data[0]).toMatchObject({
      id: "moonveil",
      name: "Moonveil",
      gameVersion: REGULATION_TEST_GAME_VERSION,
    });
  });

  it("returns not found for an unknown valid weapon ID", async () => {
    const response = await request(app).get("/api/weapons/unknown-weapon");

    expect(response.status).toBe(404);
    expect(response.body.data).toEqual([]);
  });

  it("rejects invalid list queries and weapon IDs", async () => {
    const [queryResponse, idResponse] = await Promise.all([
      request(app).get("/api/weapons?limit=101"),
      request(app).get("/api/weapons/not_valid"),
    ]);

    expect(queryResponse.status).toBe(400);
    expect(queryResponse.body.data).toEqual([]);
    expect(idResponse.status).toBe(400);
    expect(idResponse.body.data).toEqual([]);
  });
});
