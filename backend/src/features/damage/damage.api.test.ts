import type { RequestHandler } from "express";
import request from "supertest";
import { describe, expect, it } from "vitest";
import { createApp } from "../../app";

const passThroughAuthentication: RequestHandler = (_req, _res, next) => {
  next();
};

const app = createApp({
  authenticationMiddleware: passThroughAuthentication,
  getAuthenticatedUserId: () => null,
});

function createDamageRequest() {
  return {
    attackRating: {
      physical: 200,
      magic: 100,
      fire: 0,
      lightning: 0,
      holy: 0,
    },
  };
}

describe("POST /api/damage/calculate", () => {
  it("returns boss-independent offensive output and defaults the motion value", async () => {
    const response = await request(app)
      .post("/api/damage/calculate")
      .send(createDamageRequest());

    expect(response.status).toBe(200);
    expect(response.body.message).toBe("Damage calculated");
    expect(response.body.data).toHaveLength(1);
    expect(response.body.data[0]).toMatchObject({
      motionValue: 100,
      accuracy: "estimated",
      attackRating: { total: 300 },
      offensiveOutput: { physical: 200, magic: 100, total: 300 },
    });
    expect(response.body.data[0]).not.toHaveProperty("target");
    expect(response.body.data[0]).not.toHaveProperty("damage");
  });

  it("rejects client-supplied target values", async () => {
    const response = await request(app)
      .post("/api/damage/calculate")
      .send({ ...createDamageRequest(), target: {} });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      status: 400,
      message: "Invalid damage calculation data",
      data: [],
    });
  });

  it("rejects unknown fields instead of silently accepting them", async () => {
    const response = await request(app)
      .post("/api/damage/calculate")
      .send({ ...createDamageRequest(), unexpected: true });

    expect(response.status).toBe(400);
  });

  it("rejects an invalid boss ID", async () => {
    const response = await request(app)
      .post("/api/damage/calculate")
      .send({ ...createDamageRequest(), bossId: "invalid_id" });

    expect(response.status).toBe(400);
    expect(response.body.data).toEqual([]);
  });
});
