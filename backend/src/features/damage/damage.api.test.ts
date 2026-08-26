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
    target: {
      defense: 100,
      absorption: {
        physical: 20,
        magic: 40,
        fire: 0,
        lightning: 0,
        holy: 0,
      },
    },
  };
}

describe("POST /api/damage/calculate", () => {
  it("calculates damage publicly and defaults the motion value", async () => {
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
      damage: { physical: 106, magic: 24, total: 130 },
    });
  });

  it("rejects incomplete target values", async () => {
    const input = createDamageRequest();
    const response = await request(app)
      .post("/api/damage/calculate")
      .send({ ...input, target: { defense: 100 } });

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
      .send({ ...createDamageRequest(), bossId: "margit" });

    expect(response.status).toBe(400);
  });

});
