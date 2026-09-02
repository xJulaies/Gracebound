import { describe, expect, it } from "vitest";
import { IconAssetModel } from "./iconAsset.model";

describe("IconAssetModel", () => {
  const valid = {
    gameVersion: "1.17.0",
    checksum: "a".repeat(64),
    iconIds: [6000],
    mimeType: "image/webp" as const,
    width: 160,
    height: 160,
    size: 10,
    data: Buffer.alloc(10),
    sourceHash: "b".repeat(64),
    importedAt: new Date(),
  };

  it("accepts a deduplicated WebP asset", async () => {
    await expect(new IconAssetModel(valid).validate()).resolves.toBeUndefined();
  });

  it("rejects empty and duplicate icon mappings", async () => {
    await expect(new IconAssetModel({ ...valid, iconIds: [] }).validate()).rejects.toThrow();
    await expect(new IconAssetModel({ ...valid, iconIds: [6000, 6000] }).validate()).rejects.toThrow();
  });
});
