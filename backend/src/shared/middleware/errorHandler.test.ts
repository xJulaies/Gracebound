import express from "express";
import request from "supertest";
import { afterEach, describe, expect, it, vi } from "vitest";
import { createError } from "../errors/createError";
import { errorHandler } from "./errorHandler";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("errorHandler", () => {
  it("returns the message of an expected application error", async () => {
    const testApp = express();
    testApp.get("/failure", () => {
      throw createError(400, "Expected test error");
    });
    testApp.use(errorHandler);

    const response = await request(testApp).get("/failure");

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      status: 400,
      message: "Expected test error",
      data: [],
    });
  });

  it("hides details of an unexpected internal error", async () => {
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    const testApp = express();
    testApp.get("/failure", () => {
      throw new Error("Sensitive internal information");
    });
    testApp.use(errorHandler);

    const response = await request(testApp).get("/failure");

    expect(response.status).toBe(500);
    expect(response.body).toEqual({
      status: 500,
      message: "Internal server error",
      data: [],
    });
    expect(response.body.message).not.toContain("Sensitive");
  });
});
