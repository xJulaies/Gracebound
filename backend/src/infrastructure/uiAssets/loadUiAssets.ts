import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import { z } from "zod";
import { UI_ASSET_IDS, type UiAssetData } from "../../features/assets/domain/uiAsset.types";

const MAX_TOTAL_BYTES = 1024 * 1024;
const entrySchema = z.object({
  assetId: z.enum(UI_ASSET_IDS),
  assetFile: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*\.webp$/),
  checksum: z.string().regex(/^[a-f0-9]{64}$/),
  width: z.number().int().positive(),
  height: z.number().int().positive(),
  size: z.number().int().positive(),
});
const manifestSchema = z.object({
  extracted: z.literal(UI_ASSET_IDS.length),
  totalBytes: z.number().int().positive(),
  manifest: z.array(entrySchema).length(UI_ASSET_IDS.length),
});

export async function loadUiAssets(manifestFilename: string) {
  const manifestBytes = await readFile(manifestFilename);
  const parsed = manifestSchema.parse(JSON.parse(manifestBytes.toString("utf8")));
  const ids = parsed.manifest.map(({ assetId }) => assetId);
  if (new Set(ids).size !== UI_ASSET_IDS.length) {
    throw new Error("UI asset manifest contains duplicate IDs");
  }
  const assetDirectory = path.join(path.dirname(manifestFilename), "assets");
  const assets: UiAssetData[] = await Promise.all(parsed.manifest.map(async (entry) => {
    const data = await readFile(path.join(assetDirectory, entry.assetFile));
    const checksum = createHash("sha256").update(data).digest("hex");
    if (data.length !== entry.size || checksum !== entry.checksum) {
      throw new Error(`UI asset checksum or size mismatch for ${entry.assetId}`);
    }
    const metadata = await sharp(data).metadata();
    if (metadata.format !== "webp" || metadata.width !== entry.width || metadata.height !== entry.height) {
      throw new Error(`UI asset format mismatch for ${entry.assetId}`);
    }
    return { ...entry, mimeType: "image/webp" as const, data };
  }));
  const totalBytes = assets.reduce((total, { size }) => total + size, 0);
  if (totalBytes !== parsed.totalBytes) throw new Error("UI asset total size is inconsistent");
  if (totalBytes > MAX_TOTAL_BYTES) throw new Error("UI assets exceed the 1 MiB storage budget");
  return {
    assets,
    totalBytes,
    sourceHash: createHash("sha256").update(manifestBytes).digest("hex"),
  };
}
