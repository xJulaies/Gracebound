import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import { z } from "zod";
import type { CharacterClassImageAssetData } from "../../features/assets/domain/characterClassImageAsset.types";

const EXPECTED_CLASS_IDS = [
  "vagabond",
  "warrior",
  "hero",
  "bandit",
  "astrologer",
  "prophet",
  "samurai",
  "prisoner",
  "confessor",
  "wretch",
] as const;
const MAX_TOTAL_BYTES = 5 * 1024 * 1024;
const manifestEntrySchema = z.object({
  classId: z.enum(EXPECTED_CLASS_IDS),
  sourceFile: z.string().min(1),
  assetFile: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*\.webp$/),
  width: z.literal(520),
  height: z.literal(624),
  mimeType: z.literal("image/webp"),
  size: z.number().int().positive(),
  checksum: z.string().regex(/^[a-f0-9]{64}$/),
});
const manifestSchema = z.array(manifestEntrySchema).length(EXPECTED_CLASS_IDS.length);

export interface LoadedCharacterClassImageAssets {
  assets: CharacterClassImageAssetData[];
  sourceHash: string;
  totalBytes: number;
}

export async function loadCharacterClassImageAssets(
  manifestFilename: string,
): Promise<LoadedCharacterClassImageAssets> {
  const manifestBytes = await readFile(manifestFilename);
  const manifest = manifestSchema.parse(JSON.parse(manifestBytes.toString("utf8")));
  const classIds = manifest.map(({ classId }) => classId);
  if (new Set(classIds).size !== EXPECTED_CLASS_IDS.length) {
    throw new Error("Character class image manifest contains duplicate classes");
  }

  const assetsDirectory = path.join(path.dirname(manifestFilename), "optimized");
  const assets = await Promise.all(manifest.map(async (entry) => {
    const data = await readFile(path.join(assetsDirectory, entry.assetFile));
    if (data.length !== entry.size) {
      throw new Error(`Character class image size mismatch for ${entry.classId}`);
    }
    const checksum = createHash("sha256").update(data).digest("hex");
    if (checksum !== entry.checksum) {
      throw new Error(`Character class image checksum mismatch for ${entry.classId}`);
    }
    const metadata = await sharp(data).metadata();
    if (
      metadata.format !== "webp" ||
      metadata.width !== entry.width ||
      metadata.height !== entry.height
    ) {
      throw new Error(`Character class image format mismatch for ${entry.classId}`);
    }
    return {
      classId: entry.classId,
      checksum,
      mimeType: entry.mimeType,
      width: entry.width,
      height: entry.height,
      size: entry.size,
      data,
    };
  }));
  const totalBytes = assets.reduce((total, { size }) => total + size, 0);
  if (totalBytes > MAX_TOTAL_BYTES) {
    throw new Error("Character class images exceed the 5 MiB storage budget");
  }

  return {
    assets,
    sourceHash: createHash("sha256").update(manifestBytes).digest("hex"),
    totalBytes,
  };
}
