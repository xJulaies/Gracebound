import type { RequestHandler } from "express";
import request from "supertest";
import { beforeEach, describe, expect, it } from "vitest";
import { createApp } from "../../app";
import { saveBrandingImageAsset } from "../../infrastructure/brandingImages/saveBrandingImageAsset";
import { useMongoMemoryServer } from "../../test/useMongoMemoryServer";

const passThroughAuthentication: RequestHandler = (_request, _response, next) => next();
const app = createApp({
  authenticationMiddleware: passThroughAuthentication,
  getAuthenticatedUserId: () => null,
});
const image = Buffer.from("test-webp-bytes");
const checksum = "a".repeat(64);

useMongoMemoryServer({ replicaSet: true });

beforeEach(() => Promise.all([
  saveBrandingImageAsset({
    assetId: "gracebound-hero-desktop",
    checksum,
    mimeType: "image/webp",
    width: 2048,
    height: 1152,
    size: image.length,
    data: image,
    sourceHash: "d".repeat(64),
  }),
  saveBrandingImageAsset({
    assetId: "gracebound-hero",
    checksum,
    mimeType: "image/webp",
    width: 1200,
    height: 1200,
    size: image.length,
    data: image,
    sourceHash: "b".repeat(64),
  }),
  saveBrandingImageAsset({
    assetId: "gracebound-navbar-logo",
    checksum,
    mimeType: "image/webp",
    width: 900,
    height: 300,
    size: image.length,
    data: image,
    sourceHash: "c".repeat(64),
  }),
]));

describe("public branding image API", () => {
  it("returns the WebP hero with cache metadata", async () => {
    const response = await request(app).get("/api/assets/branding/gracebound-hero");

    expect(response.status).toBe(200);
    expect(response.headers["content-type"]).toBe("image/webp");
    expect(response.headers.etag).toBe(`"${checksum}"`);
    expect(response.body).toEqual(image);
  });

  it("returns the navbar logo", async () => {
    const response = await request(app).get(
      "/api/assets/branding/gracebound-navbar-logo",
    );

    expect(response.status).toBe(200);
    expect(response.headers["content-type"]).toBe("image/webp");
    expect(response.body).toEqual(image);
  });

  it("returns the desktop hero", async () => {
    const response = await request(app).get(
      "/api/assets/branding/gracebound-hero-desktop",
    );

    expect(response.status).toBe(200);
    expect(response.headers["content-type"]).toBe("image/webp");
    expect(response.body).toEqual(image);
  });

  it("rejects unknown branding asset IDs", async () => {
    const response = await request(app).get("/api/assets/branding/unknown");

    expect(response.status).toBe(400);
    expect(response.body.data).toEqual([]);
  });
});
