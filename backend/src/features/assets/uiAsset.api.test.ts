import type { RequestHandler } from "express";
import request from "supertest";
import { beforeEach, describe, expect, it } from "vitest";
import { createApp } from "../../app";
import { UI_ASSET_IDS } from "./domain/uiAsset.types";
import { UiAssetModel } from "./models/uiAsset.model";
import { saveUiAssets } from "../../infrastructure/uiAssets/saveUiAssets";
import { useMongoMemoryServer } from "../../test/useMongoMemoryServer";

const passThroughAuthentication: RequestHandler = (_request, _response, next) => next();
const app = createApp({
  authenticationMiddleware: passThroughAuthentication,
  getAuthenticatedUserId: () => null,
});
const image = Buffer.from("test-webp-bytes");
const checksum = "a".repeat(64);

useMongoMemoryServer({ replicaSet: true });

beforeEach(() => saveUiAssets(UI_ASSET_IDS.map((assetId) => ({
  assetId,
  checksum,
  mimeType: "image/webp" as const,
  width: 160,
  height: 160,
  size: image.length,
  data: image,
})), { gameVersion: "1.17.0", sourceHash: "b".repeat(64) }));

describe("public UI asset API", () => {
  it("returns WebP bytes with cache metadata", async () => {
    const response = await request(app).get("/api/assets/ui/slot-base");

    expect(response.status).toBe(200);
    expect(response.headers["content-type"]).toBe("image/webp");
    expect(response.headers.etag).toBe(`"${checksum}"`);
    expect(response.body).toEqual(image);
  });

  it("returns not found for a supported but missing asset", async () => {
    await UiAssetModel.deleteOne({ assetId: "slot-base", gameVersion: "1.17.0" });
    const response = await request(app).get("/api/assets/ui/slot-base");
    expect(response.status).toBe(404);
    expect(response.body.data).toEqual([]);
  });

  it("rejects unsupported asset IDs", async () => {
    const response = await request(app).get("/api/assets/ui/not-supported");
    expect(response.status).toBe(400);
    expect(response.body.data).toEqual([]);
  });
});
