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
