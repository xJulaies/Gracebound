import { mkdtemp, mkdir, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import sharp from "sharp";
import { describe, expect, it } from "vitest";
import { extractIcons } from "./extractIcons";

describe("extractIcons", () => {
  it("extracts requested IDs, reports missing IDs, and deduplicates identical images", async () => {
    const root = await mkdtemp(path.join(tmpdir(), "gracebound-icons-"));
    const layouts = path.join(root, "layouts");
    const output = path.join(root, "output");
    await mkdir(layouts);
    await writeFile(path.join(layouts, "atlas.layout"), `<TextureAtlas imagePath="atlas.png">
      <SubTexture name="MENU_ItemIcon_1.png" x="0" y="0" width="2" height="2" half="0"/>
      <SubTexture name="MENU_ItemIcon_2.png" x="2" y="0" width="2" height="2" half="0"/>
    </TextureAtlas>`);
    const atlas = path.join(root, "atlas.png");
    const pixels = Buffer.from([
      255, 0, 0, 255, 255, 0, 0, 255, 255, 0, 0, 255, 255, 0, 0, 255,
    ]);
    await sharp(pixels, { raw: { width: 4, height: 1, channels: 4 } })
      .resize(4, 2, { kernel: "nearest" })
      .png()
      .toFile(atlas);

    const report = await extractIcons({
      iconIds: [2, 1, 1, 404],
      layoutDirectory: layouts,
      textureDirectory: root,
      outputDirectory: output,
      texconvPath: "unused",
      convertAtlas: async () => atlas,
    });

    expect(report.requested).toBe(3);
    expect(report.extracted).toBe(2);
    expect(report.missingIconIds).toEqual([404]);
    expect(report.uniqueAssets).toBe(1);
    expect(report.duplicateImages).toBe(1);
    expect(report.totalBytes).toBeGreaterThan(0);
    expect(report.manifest[0].assetFile).toBe(report.manifest[1].assetFile);
    expect(JSON.parse(await readFile(path.join(output, "manifest.json"), "utf8"))).toEqual(report);
  });
});
