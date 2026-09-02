import { model, Schema } from "mongoose";

export interface CharacterClassImageAssetRecord {
  gameVersion: string;
  classId: string;
  checksum: string;
  mimeType: "image/webp";
  width: number;
  height: number;
  size: number;
  data: Buffer;
  sourceHash: string;
  importedAt: Date;
}

const characterClassImageAssetSchema = new Schema<CharacterClassImageAssetRecord>({
  gameVersion: { type: String, required: true },
  classId: { type: String, required: true, match: /^[a-z0-9]+(?:-[a-z0-9]+)*$/ },
  checksum: { type: String, required: true, match: /^[a-f0-9]{64}$/ },
  mimeType: { type: String, required: true, enum: ["image/webp"] },
  width: { type: Number, required: true, min: 1 },
  height: { type: Number, required: true, min: 1 },
  size: { type: Number, required: true, min: 1 },
  data: { type: Buffer, required: true },
  sourceHash: { type: String, required: true, match: /^[a-f0-9]{64}$/ },
  importedAt: { type: Date, required: true },
});

characterClassImageAssetSchema.index(
  { gameVersion: 1, classId: 1 },
  { unique: true },
);

export const CharacterClassImageAssetModel = model<CharacterClassImageAssetRecord>(
  "CharacterClassImageAsset",
  characterClassImageAssetSchema,
);
