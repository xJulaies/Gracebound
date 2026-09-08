import sharp from "sharp";
import { describe, expect, it } from "vitest";
import { prepareBrandingImageVariant } from "./prepareBrandingImageVariant";

describe("prepareBrandingImageVariant", () => {
  it("creates a cropped WebP variant with the requested dimensions", async () => {
    const source = await sharp({
      create: { width: 1200, height: 800, channels: 3, background: "gold" },
    })
      .webp()
      .toBuffer();

    const variant = await prepareBrandingImageVariant(
      { data: source, sourceHash: "a".repeat(64) },
      {
        assetId: "gracebound-background-grace-mobile",
        width: 768,
        height: 1366,
        quality: 68,
      },
    );

    expect(variant).toMatchObject({
      assetId: "gracebound-background-grace-mobile",
      mimeType: "image/webp",
      width: 768,
      height: 1366,
      sourceHash: "a".repeat(64),
    });
    expect(variant.size).toBe(variant.data.length);
    expect(variant.checksum).toMatch(/^[a-f0-9]{64}$/);
  });
});
