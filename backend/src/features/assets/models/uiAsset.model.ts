import { model, Schema } from "mongoose";
import { UI_ASSET_IDS, type UiAssetData } from "../domain/uiAsset.types";

export type UiAssetRecord = UiAssetData & {
  gameVersion: string;
  sourceHash: string;
  importedAt: Date;
};

const uiAssetSchema = new Schema<UiAssetRecord>({
  gameVersion: { type: String, required: true },
  assetId: { type: String, required: true, enum: UI_ASSET_IDS },
  checksum: { type: String, required: true, match: /^[a-f0-9]{64}$/ },
  mimeType: { type: String, required: true, enum: ["image/webp"] },
  width: { type: Number, required: true, min: 1 },
  height: { type: Number, required: true, min: 1 },
  size: { type: Number, required: true, min: 1, max: 1_048_576 },
  data: { type: Buffer, required: true },
  sourceHash: { type: String, required: true, match: /^[a-f0-9]{64}$/ },
  importedAt: { type: Date, required: true },
}, { collection: "uiAssets", versionKey: false });

uiAssetSchema.index({ gameVersion: 1, assetId: 1 }, { unique: true });

export const UiAssetModel = model<UiAssetRecord>("UiAsset", uiAssetSchema);
