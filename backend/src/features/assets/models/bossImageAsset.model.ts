import { model, Schema } from "mongoose";

export interface BossImageAssetRecord {
  gameVersion: string;
  bossId: string;
  checksum: string;
  mimeType: "image/webp";
  width: number;
  height: number;
  size: number;
  data: Buffer;
  sourceHash: string;
  importedAt: Date;
}

const bossImageAssetSchema = new Schema<BossImageAssetRecord>({
  gameVersion: { type: String, required: true },
  bossId: { type: String, required: true, match: /^[a-z0-9]+(?:-[a-z0-9]+)*$/ },
  checksum: { type: String, required: true, match: /^[a-f0-9]{64}$/ },
  mimeType: { type: String, required: true, enum: ["image/webp"] },
  width: { type: Number, required: true, min: 1 },
  height: { type: Number, required: true, min: 1 },
  size: { type: Number, required: true, min: 1, max: 262_144 },
  data: { type: Buffer, required: true },
  sourceHash: { type: String, required: true, match: /^[a-f0-9]{64}$/ },
  importedAt: { type: Date, required: true },
});

bossImageAssetSchema.index({ gameVersion: 1, bossId: 1 }, { unique: true });

export const BossImageAssetModel = model<BossImageAssetRecord>(
  "BossImageAsset",
  bossImageAssetSchema,
);
