import { model, Schema } from "mongoose";
import {
  WEAPON_AFFINITIES,
  type WeaponCatalogEntry,
  type WeaponVariantReference,
} from "../domain/weaponCatalog.types";

export type WeaponCatalogRecord = WeaponCatalogEntry & {
  source: "REGULATION";
  gameVersion: string;
  sourceHash: string;
  importedAt: Date;
};

const variantReferenceSchema = new Schema<WeaponVariantReference>(
  {
    id: { type: String, required: true },
    sourceId: { type: Number, required: true, min: 1 },
    affinity: {
      type: String,
      required: true,
      enum: WEAPON_AFFINITIES,
    },
  },
  { _id: false },
);

const weaponCatalogSchema = new Schema<WeaponCatalogRecord>(
  {
    id: { type: String, required: true },
    sourceId: { type: Number, required: true, min: 1 },
    name: { type: String, required: true },
    categoryId: { type: Number, required: true, min: 1 },
    weaponTypeId: { type: Number, required: true, min: 0 },
    weight: { type: Number, required: true, min: 0 },
    iconId: { type: Number, required: true, min: 0 },
    swordArtId: { type: Number, min: 0, default: null },
    canChangeAffinity: { type: Boolean, required: true },
    variants: {
      type: [variantReferenceSchema],
      required: true,
      validate: {
        validator: (variants: WeaponVariantReference[]) =>
          variants.length > 0 &&
          new Set(variants.map(({ affinity }) => affinity)).size ===
            variants.length,
        message: "Weapon variants must contain unique affinities",
      },
    },
    source: { type: String, required: true, enum: ["REGULATION"] },
    gameVersion: { type: String, required: true },
    sourceHash: {
      type: String,
      required: true,
      match: /^[a-f0-9]{64}$/,
    },
    importedAt: { type: Date, required: true },
  },
  {
    collection: "weapons",
    versionKey: false,
  },
);

weaponCatalogSchema.index({ gameVersion: 1, id: 1 }, { unique: true });

export const WeaponCatalogModel = model<WeaponCatalogRecord>(
  "WeaponCatalog",
  weaponCatalogSchema,
);
