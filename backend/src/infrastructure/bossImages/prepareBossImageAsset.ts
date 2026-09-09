import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import sharp from "sharp";
import type { BossImageAssetData } from "../../features/assets/domain/bossImageAsset.types";

const PORTRAIT_SIZE = 320;
const MAX_FILE_SIZE = 262_144;

export async function prepareBossImageAsset(
  sourceFilename: string,
  bossId: string,
): Promise<BossImageAssetData> {
  const source = await readFile(sourceFilename);
  const data = await sharp(source)
    .resize(PORTRAIT_SIZE, PORTRAIT_SIZE, { fit: "cover", kernel: "nearest" })
    .webp({ quality: 88, effort: 6 })
    .toBuffer();
  const metadata = await sharp(data).metadata();

  if (metadata.format !== "webp" || metadata.width !== PORTRAIT_SIZE || metadata.height !== PORTRAIT_SIZE) {
    throw new Error(`Failed to prepare boss image ${bossId}`);
  }
  if (data.length > MAX_FILE_SIZE) throw new Error(`Boss image ${bossId} exceeds 256 KiB`);

  return {
    bossId,
    checksum: createHash("sha256").update(data).digest("hex"),
    mimeType: "image/webp",
    width: metadata.width,
    height: metadata.height,
    size: data.length,
    data,
    sourceHash: createHash("sha256").update(source).digest("hex"),
  };
}
