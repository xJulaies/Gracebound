import express from "express";
import request from "supertest";
import { describe, expect, it } from "vitest";
import {
  createBuildListRateLimiter,
  createBuildMutationRateLimiter,
  createCalculationRateLimiter,
} from "./rateLimiters";

describe("calculation rate limiter", () => {
  it("returns a consistent 429 response after the configured limit", async () => {
    const app = express();
    app.use(createCalculationRateLimiter({ limit: 2, windowMs: 60_000 }));
    app.get("/calculate", (_request, response) => response.status(200).json({ ok: true }));

    const responses = [
      await request(app).get("/calculate"),
      await request(app).get("/calculate"),
      await request(app).get("/calculate"),
    ];

    expect(responses.map(({ status }) => status)).toEqual([200, 200, 429]);
    expect(responses[2]?.body).toEqual({
      status: 429,
      message: "Calculation request limit exceeded",
      data: [],
    });
    expect(responses[0]?.headers["ratelimit-policy"]).toBeDefined();
    expect(responses[0]?.headers["x-ratelimit-limit"]).toBeUndefined();
  });
});

describe("build rate limiters", () => {
  it("limits build-list reads independently", async () => {
    const app = express();
    app.use(createBuildListRateLimiter({ limit: 1, windowMs: 60_000 }));
    app.get("/builds", (_request, response) => response.sendStatus(200));

    expect((await request(app).get("/builds")).status).toBe(200);
    const limited = await request(app).get("/builds");
    expect(limited.status).toBe(429);
    expect(limited.body.message).toBe("Build list request limit exceeded");
  });

  it("keys build mutations by authenticated user", async () => {
    const app = express();
    app.use((request, response, next) => {
      response.locals.authenticatedUserId = request.header("x-test-user-id");
      next();
    });
    app.use(createBuildMutationRateLimiter({ limit: 1, windowMs: 60_000 }));
    app.post("/builds", (_request, response) => response.sendStatus(201));

    expect((await request(app).post("/builds").set("x-test-user-id", "user-1")).status)
      .toBe(201);
    expect((await request(app).post("/builds").set("x-test-user-id", "user-1")).status)
      .toBe(429);
    expect((await request(app).post("/builds").set("x-test-user-id", "user-2")).status)
      .toBe(201);
  });
});
