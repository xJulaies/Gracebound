import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import { z } from "zod";
import type { IconAssetData } from "../../features/assets/domain/iconAsset.types";

const MAX_ASSET_BYTES = 150 * 1024 * 1024;
const manifestEntrySchema = z.object({
  iconId: z.number().int().nonnegative(),
  assetFile: z.string().regex(/^[a-f0-9]{64}\.webp$/),
  checksum: z.string().regex(/^[a-f0-9]{64}$/),
  width: z.number().int().positive(),
  height: z.number().int().positive(),
  size: z.number().int().positive(),
});
const manifestSchema = z.object({
  requested: z.number().int().nonnegative(),
  extracted: z.number().int().nonnegative(),
  missingIconIds: z.array(z.number().int().nonnegative()),
  uniqueAssets: z.number().int().nonnegative(),
  totalBytes: z.number().int().nonnegative(),
  manifest: z.array(manifestEntrySchema),
});
type ManifestEntry = z.infer<typeof manifestEntrySchema>;

export interface LoadedIconAssets {
  assets: IconAssetData[];
  sourceHash: string;
  totalBytes: number;
}

export async function loadIconAssets(manifestFilename: string): Promise<LoadedIconAssets> {
  const manifestBytes = await readFile(manifestFilename);
  const parsed = manifestSchema.parse(JSON.parse(manifestBytes.toString("utf8")));
  if (parsed.missingIconIds.length > 0 || parsed.extracted !== parsed.requested) {
    throw new Error("Icon manifest is incomplete");
  }
  const iconIds = parsed.manifest.map(({ iconId }) => iconId);
  if (new Set(iconIds).size !== iconIds.length) throw new Error("Icon manifest contains duplicate IDs");

  const byChecksum = new Map<string, ManifestEntry[]>();
  for (const entry of parsed.manifest) {
    byChecksum.set(entry.checksum, [...(byChecksum.get(entry.checksum) ?? []), entry]);
  }
  if (byChecksum.size !== parsed.uniqueAssets) throw new Error("Icon manifest asset count is inconsistent");

  const assetsDirectory = path.join(path.dirname(manifestFilename), "assets");
  const assets = await Promise.all([...byChecksum].map(async ([checksum, entries]) => {
    const first = entries[0];
    if (entries.some(({ assetFile, width, height, size }) =>
      assetFile !== first.assetFile || width !== first.width || height !== first.height || size !== first.size)) {
      throw new Error(`Icon asset metadata conflicts for ${checksum}`);
    }
    const data = await readFile(path.join(assetsDirectory, first.assetFile));
    if (data.length !== first.size) throw new Error(`Icon asset size mismatch for ${checksum}`);
    if (createHash("sha256").update(data).digest("hex") !== checksum) {
      throw new Error(`Icon asset checksum mismatch for ${checksum}`);
    }
    const metadata = await sharp(data).metadata();
    if (metadata.format !== "webp" || metadata.width !== first.width || metadata.height !== first.height) {
      throw new Error(`Icon asset dimensions or format mismatch for ${checksum}`);
    }
    return {
      checksum,
      iconIds: entries.map(({ iconId }) => iconId).sort((left, right) => left - right),
      mimeType: "image/webp" as const,
      width: first.width,
      height: first.height,
      size: data.length,
      data,
    };
  }));
  const totalBytes = assets.reduce((total, { size }) => total + size, 0);
  if (totalBytes !== parsed.totalBytes) throw new Error("Icon manifest total size is inconsistent");
  if (totalBytes > MAX_ASSET_BYTES) throw new Error("Icon assets exceed the 150 MiB storage budget");

  return {
    assets,
    sourceHash: createHash("sha256").update(manifestBytes).digest("hex"),
    totalBytes,
  };
}
