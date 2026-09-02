import { createHash } from "node:crypto";
import { mkdtemp, mkdir, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import sharp from "sharp";
import { describe, expect, it } from "vitest";
import { loadIconAssets } from "./loadIconAssets";

describe("loadIconAssets", () => {
  it("validates and groups icon IDs by binary checksum", async () => {
    const fixture = await createFixture([6000, 6015]);
    const loaded = await loadIconAssets(fixture);

    expect(loaded.assets).toHaveLength(1);
    expect(loaded.assets[0]).toMatchObject({ iconIds: [6000, 6015], width: 2, height: 2 });
    expect(loaded.totalBytes).toBe(loaded.assets[0].size);
    expect(loaded.sourceHash).toMatch(/^[a-f0-9]{64}$/);
  });

  it("rejects modified image bytes", async () => {
    const fixture = await createFixture([6000]);
    const parsed = JSON.parse(await readFile(fixture, "utf8"));
    await writeFile(path.join(path.dirname(fixture), "assets", parsed.manifest[0].assetFile), "changed");
    await expect(loadIconAssets(fixture)).rejects.toThrow("size mismatch");
  });
});

async function createFixture(iconIds: number[]) {
  const root = await mkdtemp(path.join(tmpdir(), "gracebound-icon-import-"));
  const assetsDirectory = path.join(root, "assets");
  await mkdir(assetsDirectory);
  const data = await sharp({
    create: { width: 2, height: 2, channels: 4, background: "red" },
  }).webp({ quality: 90 }).toBuffer();
  const checksum = createHash("sha256").update(data).digest("hex");
  const assetFile = `${checksum}.webp`;
  await writeFile(path.join(assetsDirectory, assetFile), data);
  const entries = iconIds.map((iconId) => ({
    iconId, assetFile, checksum, width: 2, height: 2, size: data.length,
  }));
  const manifest = {
    requested: iconIds.length, extracted: iconIds.length, missingIconIds: [],
    uniqueAssets: 1, duplicateImages: iconIds.length - 1, totalBytes: data.length,
    manifest: entries,
  };
  const filename = path.join(root, "manifest.json");
  await writeFile(filename, JSON.stringify(manifest));
  return filename;
}
