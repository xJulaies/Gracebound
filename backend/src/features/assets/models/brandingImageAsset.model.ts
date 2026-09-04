import { model, Schema } from "mongoose";

export interface BrandingImageAssetRecord {
  assetId: string;
  checksum: string;
  mimeType: "image/webp";
  width: number;
  height: number;
  size: number;
  data: Buffer;
  sourceHash: string;
  importedAt: Date;
}

const brandingImageAssetSchema = new Schema<BrandingImageAssetRecord>({
  assetId: { type: String, required: true, unique: true, match: /^[a-z0-9]+(?:-[a-z0-9]+)*$/ },
  checksum: { type: String, required: true, match: /^[a-f0-9]{64}$/ },
  mimeType: { type: String, required: true, enum: ["image/webp"] },
  width: { type: Number, required: true, min: 1 },
  height: { type: Number, required: true, min: 1 },
  size: { type: Number, required: true, min: 1, max: 2_097_152 },
  data: { type: Buffer, required: true },
  sourceHash: { type: String, required: true, match: /^[a-f0-9]{64}$/ },
  importedAt: { type: Date, required: true },
});

export const BrandingImageAssetModel = model<BrandingImageAssetRecord>(
  "BrandingImageAsset",
  brandingImageAssetSchema,
);
