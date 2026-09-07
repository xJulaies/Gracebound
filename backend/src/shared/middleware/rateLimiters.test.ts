import express from "express";
import request from "supertest";
import { describe, expect, it } from "vitest";
import { createCalculationRateLimiter } from "./rateLimiters";

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
