import { model, Schema } from "mongoose";

export interface IconAssetRecord {
  gameVersion: string;
  checksum: string;
  iconIds: number[];
  mimeType: "image/webp";
  width: number;
  height: number;
  size: number;
  data: Buffer;
  sourceHash: string;
  importedAt: Date;
}

const iconAssetSchema = new Schema<IconAssetRecord>({
  gameVersion: { type: String, required: true },
  checksum: { type: String, required: true, match: /^[a-f0-9]{64}$/ },
  iconIds: {
    type: [{ type: Number, min: 0 }],
    required: true,
    validate: {
      validator: (values: number[]) => values.length > 0 && new Set(values).size === values.length,
      message: "Icon asset must contain unique icon IDs",
    },
  },
  mimeType: { type: String, required: true, enum: ["image/webp"] },
  width: { type: Number, required: true, min: 1 },
  height: { type: Number, required: true, min: 1 },
  size: { type: Number, required: true, min: 1 },
  data: { type: Buffer, required: true },
  sourceHash: { type: String, required: true, match: /^[a-f0-9]{64}$/ },
  importedAt: { type: Date, required: true },
});

iconAssetSchema.index({ gameVersion: 1, checksum: 1 }, { unique: true });
iconAssetSchema.index({ gameVersion: 1, iconIds: 1 }, { unique: true });

export const IconAssetModel = model<IconAssetRecord>("IconAsset", iconAssetSchema);
