import type { RequestHandler } from "express";
import request from "supertest";
import { beforeEach, describe, expect, it } from "vitest";
import { createApp } from "../../app";
import { saveBossImageAsset } from "../../infrastructure/bossImages/saveBossImageAsset";
import { useMongoMemoryServer } from "../../test/useMongoMemoryServer";

const passThroughAuthentication: RequestHandler = (_request, _response, next) => next();
const app = createApp({
  authenticationMiddleware: passThroughAuthentication,
  getAuthenticatedUserId: () => null,
});
const image = Buffer.from("test-webp-bytes");
const checksum = "a".repeat(64);

useMongoMemoryServer({ replicaSet: true });

beforeEach(() => saveBossImageAsset({
  bossId: "margit-the-fell-omen",
  checksum,
  mimeType: "image/webp",
  width: 320,
  height: 320,
  size: image.length,
  data: image,
  sourceHash: "b".repeat(64),
}, "1.17.0"));

describe("public boss image API", () => {
  it("returns WebP bytes with cache metadata", async () => {
    const response = await request(app).get("/api/assets/bosses/margit-the-fell-omen");

    expect(response.status).toBe(200);
    expect(response.headers["content-type"]).toBe("image/webp");
    expect(response.headers.etag).toBe(`"${checksum}"`);
    expect(response.body).toEqual(image);
  });

  it("returns not found for an unknown boss image", async () => {
    const response = await request(app).get("/api/assets/bosses/unknown");
    expect(response.status).toBe(404);
  });

  it("rejects malformed boss IDs", async () => {
    const response = await request(app).get("/api/assets/bosses/Not_Valid");
    expect(response.status).toBe(400);
  });
});
