import request from "supertest";
import { describe, expect, it } from "vitest";
import { type RequestHandler } from "express";
import { createApp } from "./app";

const passThroughAuthentication: RequestHandler = (_req, _res, next) => {
  next();
};

const app = createApp({
  authenticationMiddleware: passThroughAuthentication,
  getAuthenticatedUserId: () => null,
});

describe("GET /api/health", () => {
  it("returns a successful health response", async () => {
    const response = await request(app).get("/api/health");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      status: 200,
      message: "API is healthy",
      data: [],
    });
  });

  it("adds secure HTTP response headers", async () => {
    const response = await request(app).get("/api/health");

    expect(response.headers["x-content-type-options"]).toBe("nosniff");
    expect(response.headers["referrer-policy"]).toBe("strict-origin-when-cross-origin");
    expect(response.headers["cross-origin-resource-policy"]).toBe("cross-origin");
    expect(response.headers["content-security-policy"]).toContain("default-src 'none'");
    expect(response.headers["content-security-policy"]).toContain("frame-ancestors 'none'");
  });

  it("allows the configured frontend origin", async () => {
    const response = await request(app)
      .get("/api/health")
      .set("Origin", "http://localhost:5173");

    expect(response.headers["access-control-allow-origin"]).toBe(
      "http://localhost:5173",
    );
  });

  it("does not grant CORS access to another origin", async () => {
    const response = await request(app)
      .get("/api/health")
      .set("Origin", "https://untrusted.example");

    expect(response.headers["access-control-allow-origin"]).toBeUndefined();
  });
});

describe("unknown routes", () => {
  it("returns a consistent not-found response", async () => {
    const response = await request(app).get("/api/does-not-exist");

    expect(response.status).toBe(404);
    expect(response.body).toEqual({
      status: 404,
      message: "Route not found",
      data: [],
    });
  });
});

describe("JSON request limits", () => {
  it("rejects oversized JSON bodies with a safe error response", async () => {
    const response = await request(app)
      .post("/api/builds/calculate-stats")
      .send({ payload: "x".repeat(33 * 1024) });

    expect(response.status).toBe(413);
    expect(response.body).toEqual({
      status: 413,
      message: "Request body is too large",
      data: [],
    });
  });
});
