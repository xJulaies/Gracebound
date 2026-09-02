import { createHash } from "node:crypto";
import { mkdtemp, mkdir, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import sharp from "sharp";
import { describe, expect, it } from "vitest";
import { loadCharacterClassImageAssets } from "./loadCharacterClassImageAssets";

const CLASS_IDS = [
  "vagabond", "warrior", "hero", "bandit", "astrologer",
  "prophet", "samurai", "prisoner", "confessor", "wretch",
];

describe("loadCharacterClassImageAssets", () => {
  it("validates all ten optimized class images", async () => {
    const fixture = await createFixture();
    const loaded = await loadCharacterClassImageAssets(fixture);

    expect(loaded.assets).toHaveLength(10);
    expect(loaded.assets[0]).toMatchObject({
      classId: "vagabond",
      width: 520,
      height: 624,
      mimeType: "image/webp",
    });
    expect(loaded.totalBytes).toBeGreaterThan(0);
    expect(loaded.sourceHash).toMatch(/^[a-f0-9]{64}$/);
  });

  it("rejects modified image bytes", async () => {
    const fixture = await createFixture();
    const manifest = JSON.parse(await readFile(fixture, "utf8")) as Array<{
      assetFile: string;
    }>;
    await writeFile(
      path.join(path.dirname(fixture), "optimized", manifest[0]!.assetFile),
      "changed",
    );

    await expect(loadCharacterClassImageAssets(fixture)).rejects.toThrow(
      "size mismatch",
    );
  });
});

async function createFixture() {
  const root = await mkdtemp(path.join(tmpdir(), "gracebound-class-images-"));
  const optimized = path.join(root, "optimized");
  await mkdir(optimized);
  const data = await sharp({
    create: { width: 520, height: 624, channels: 3, background: "black" },
  }).webp({ quality: 88 }).toBuffer();
  const checksum = createHash("sha256").update(data).digest("hex");
  const manifest = CLASS_IDS.map((classId) => ({
    classId,
    sourceFile: `${classId}.png`,
    assetFile: `${classId}.webp`,
    width: 520,
    height: 624,
    mimeType: "image/webp",
    size: data.length,
    checksum,
  }));
  await Promise.all(
    manifest.map(({ assetFile }) => writeFile(path.join(optimized, assetFile), data)),
  );
  const filename = path.join(root, "manifest.json");
  await writeFile(filename, JSON.stringify(manifest));
  return filename;
}
