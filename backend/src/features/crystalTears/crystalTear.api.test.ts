import type { RequestHandler } from "express";
import request from "supertest";
import { beforeEach, describe, expect, it } from "vitest";
import { createApp } from "../../app";
import { createCrystalTearRecordFixture } from "../../test/fixtures/crystalTear.fixture";
import { useMongoMemoryServer } from "../../test/useMongoMemoryServer";
import { CrystalTearModel } from "./models/crystalTear.model";

const passThrough: RequestHandler = (_request, _response, next) => next();
const app = createApp({ authenticationMiddleware: passThrough, getAuthenticatedUserId: () => null });
useMongoMemoryServer();
beforeEach(async () => { await CrystalTearModel.create([createCrystalTearRecordFixture("strength-knot-crystal-tear"), createCrystalTearRecordFixture("thorny-cracked-tear")]); });

describe("public Crystal Tear API", () => {
  it("returns public catalog fields and icon URLs", async () => {
    const response = await request(app).get("/api/crystal-tears");
    expect(response.status).toBe(200);
    expect(response.body.data).toHaveLength(2);
    expect(response.body.data[0]).toHaveProperty("iconUrl", "/api/assets/icons/400");
    expect(response.body.data[0]).not.toHaveProperty("sourceGoodsId");
  });
  it("uses one-element or empty arrays for detail results", async () => {
    const [found, missing, invalid] = await Promise.all([
      request(app).get("/api/crystal-tears/strength-knot-crystal-tear"),
      request(app).get("/api/crystal-tears/unknown"),
      request(app).get("/api/crystal-tears/not_valid"),
    ]);
    expect(found.status).toBe(200); expect(found.body.data).toHaveLength(1);
    expect(missing.status).toBe(404); expect(missing.body.data).toEqual([]);
    expect(invalid.status).toBe(400); expect(invalid.body.data).toEqual([]);
  });
});
