import type { RequestHandler } from "express";
import request from "supertest";
import { beforeEach, describe, expect, it } from "vitest";
import { createApp } from "../../app";
import { saveIconAssets } from "../../infrastructure/icons/saveIconAssets";
import { useMongoMemoryServer } from "../../test/useMongoMemoryServer";

const passThroughAuthentication: RequestHandler = (_request, _response, next) => next();
const app = createApp({
  authenticationMiddleware: passThroughAuthentication,
  getAuthenticatedUserId: () => null,
});
const checksum = "a".repeat(64);
const image = Buffer.from("test-webp-bytes");

useMongoMemoryServer({ replicaSet: true });

beforeEach(() => saveIconAssets([{
  checksum,
  iconIds: [6000, 6015],
  mimeType: "image/webp",
  width: 160,
  height: 160,
  size: image.length,
  data: image,
}], {
  gameVersion: "1.17.0",
  sourceHash: "b".repeat(64),
}));

describe("public icon asset API", () => {
  it("returns WebP bytes with cache metadata", async () => {
    const response = await request(app).get("/api/assets/icons/6000");

    expect(response.status).toBe(200);
    expect(response.headers["content-type"]).toBe("image/webp");
    expect(response.headers["content-length"]).toBe(image.length.toString());
    expect(response.headers.etag).toBe(`"${checksum}"`);
    expect(response.headers["cache-control"]).toBe(
      "public, max-age=86400, stale-while-revalidate=604800",
    );
    expect(response.body).toEqual(image);
  });

  it("returns 304 when the checksum ETag still matches", async () => {
    const response = await request(app)
      .get("/api/assets/icons/6015")
      .set("If-None-Match", `"${checksum}"`);

    expect(response.status).toBe(304);
    expect(response.body).toHaveLength(0);
  });

  it("returns not found for an unknown icon", async () => {
    const response = await request(app).get("/api/assets/icons/999999");
    expect(response.status).toBe(404);
    expect(response.body.data).toEqual([]);
  });

  it("rejects malformed icon IDs", async () => {
    const response = await request(app).get("/api/assets/icons/60x0");
    expect(response.status).toBe(400);
    expect(response.body.data).toEqual([]);
  });
});
