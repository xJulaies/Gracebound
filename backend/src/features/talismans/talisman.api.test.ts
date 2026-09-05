import type { RequestHandler } from "express";
import request from "supertest";
import { beforeEach, describe, expect, it } from "vitest";
import { createApp } from "../../app";
import { saveTalismanCatalog } from "../../infrastructure/regulation/services/saveTalismanCatalog";
import { REGULATION_TEST_GAME_VERSION, REGULATION_TEST_SOURCE_HASH } from "../../test/fixtures/regulationWeaponCatalog.fixture";
import { useMongoMemoryServer } from "../../test/useMongoMemoryServer";
import type { TalismanData } from "./domain/talisman.types";

const passThroughAuthentication: RequestHandler = (_request, _response, next) => next();
const app = createApp({ authenticationMiddleware: passThroughAuthentication, getAuthenticatedUserId: () => null });

useMongoMemoryServer({ replicaSet: true });

beforeEach(async () => {
  await saveTalismanCatalog(talismans, {
    gameVersion: REGULATION_TEST_GAME_VERSION,
    sourceHash: REGULATION_TEST_SOURCE_HASH,
  });
});

describe("public talisman API", () => {
  it("returns sorted selection data without Regulation internals", async () => {
    const response = await request(app).get("/api/talismans");
    expect(response.status).toBe(200);
    expect(response.body.data.map(({ id }: { id: string }) => id)).toEqual([
      "axe-talisman",
      "shard-of-alexander",
    ]);
    expect(response.body.data[1]).toMatchObject({
      name: "Shard of Alexander",
      iconUrl: "/api/assets/icons/1231",
      weight: 0.9,
      calculationStatus: "supported",
      gameVersion: REGULATION_TEST_GAME_VERSION,
    });
    expect(response.body.data[1]).not.toHaveProperty("sourceEffectId");
  });

  it("returns one-element or empty arrays for detail requests", async () => {
    const [found, missing, invalid] = await Promise.all([
      request(app).get("/api/talismans/shard-of-alexander"),
      request(app).get("/api/talismans/unknown"),
      request(app).get("/api/talismans/not_valid"),
    ]);
    expect(found.status).toBe(200);
    expect(found.body.data).toHaveLength(1);
    expect(missing.status).toBe(404);
    expect(missing.body.data).toEqual([]);
    expect(invalid.status).toBe(400);
    expect(invalid.body.data).toEqual([]);
  });

  it("searches and paginates talismans with a complete match count", async () => {
    const response = await request(app).get("/api/talismans?search=a&page=2&limit=1");

    expect(response.status).toBe(200);
    expect(response.headers["x-total-count"]).toBe("2");
    expect(response.body.data.map(({ id }: { id: string }) => id)).toEqual([
      "shard-of-alexander",
    ]);
  });

  it("filters talismans by calculation status", async () => {
    const response = await request(app).get(
      "/api/talismans?calculationStatus=supported",
    );

    expect(response.status).toBe(200);
    expect(response.headers["x-total-count"]).toBe("1");
    expect(response.body.data.map(({ id }: { id: string }) => id)).toEqual([
      "shard-of-alexander",
    ]);
  });

  it("rejects invalid talisman queries", async () => {
    const response = await request(app).get("/api/talismans?limit=101");

    expect(response.status).toBe(400);
    expect(response.body.data).toEqual([]);
  });
});

const talismans: TalismanData[] = [
  talisman("shard-of-alexander", 1231, "Shard of Alexander", 0.9, "supported"),
  talisman("axe-talisman", 2130, "Axe Talisman", 0.8),
];

function talisman(
  id: string,
  sourceAccessoryId: number,
  name: string,
  weight: number,
  calculationStatus: TalismanData["calculationStatus"] = "catalog-only",
): TalismanData {
  return {
    id,
    sourceAccessoryId,
    name,
    iconId: sourceAccessoryId,
    weight,
    sourceEffectId: sourceAccessoryId + 300000,
    calculationStatus,
    effects: null,
  };
}
