import type { RequestHandler } from "express";
import request from "supertest";
import { beforeEach, describe, expect, it } from "vitest";
import { createApp } from "../../app";
import { saveCharacterClassImageAssets } from "../../infrastructure/classImages/saveCharacterClassImageAssets";
import { useMongoMemoryServer } from "../../test/useMongoMemoryServer";

const passThroughAuthentication: RequestHandler = (_request, _response, next) => next();
const app = createApp({
  authenticationMiddleware: passThroughAuthentication,
  getAuthenticatedUserId: () => null,
});
const image = Buffer.from("test-webp-bytes");
const checksum = "a".repeat(64);

useMongoMemoryServer({ replicaSet: true });

beforeEach(() => saveCharacterClassImageAssets([
  "vagabond", "warrior", "hero", "bandit", "astrologer",
  "prophet", "samurai", "prisoner", "confessor", "wretch",
].map((classId) => ({
  classId,
  checksum,
  mimeType: "image/webp" as const,
  width: 520,
  height: 624,
  size: image.length,
  data: image,
})), {
  gameVersion: "1.17.0",
  sourceHash: "b".repeat(64),
}));

describe("public character class image API", () => {
  it("returns WebP bytes with cache metadata", async () => {
    const response = await request(app).get("/api/assets/character-classes/vagabond");

    expect(response.status).toBe(200);
    expect(response.headers["content-type"]).toBe("image/webp");
    expect(response.headers.etag).toBe(`"${checksum}"`);
    expect(response.body).toEqual(image);
  });

  it("returns not found for an unknown class image", async () => {
    const response = await request(app).get("/api/assets/character-classes/unknown");
    expect(response.status).toBe(404);
    expect(response.body.data).toEqual([]);
  });

  it("rejects malformed class IDs", async () => {
    const response = await request(app).get("/api/assets/character-classes/Not_Valid");
    expect(response.status).toBe(400);
    expect(response.body.data).toEqual([]);
  });
});
