import { InferSchemaType, model, Schema } from "mongoose";

const statsSchema = new Schema(
  {
    vigor: { type: Number, required: true, min: 1, max: 99 },
    mind: { type: Number, required: true, min: 1, max: 99 },
    endurance: { type: Number, required: true, min: 1, max: 99 },
    strength: { type: Number, required: true, min: 1, max: 99 },
    dexterity: { type: Number, required: true, min: 1, max: 99 },
    intelligence: { type: Number, required: true, min: 1, max: 99 },
    faith: { type: Number, required: true, min: 1, max: 99 },
    arcane: { type: Number, required: true, min: 1, max: 99 },
  },
  { _id: false },
);

const armorSchema = new Schema(
  {
    headId: { type: String, default: null },
    chestId: { type: String, default: null },
    armsId: { type: String, default: null },
    legsId: { type: String, default: null },
  },
  { _id: false },
);

const equipmentSchema = new Schema(
  {
    primaryWeaponId: { type: String, default: null },
    weaponUpgradeLevel: { type: Number, min: 0, max: 25, default: 0 },
    armor: { type: armorSchema, default: () => ({}) },
    talismanIds: { type: [String], default: () => [] },
  },
  { _id: false },
);

const buildSchema = new Schema(
  {
    ownerId: { type: String, required: true },
    name: { type: String, required: true, trim: true, maxlength: 80 },
    description: { type: String, trim: true, maxlength: 1000, default: "" },
    level: { type: Number, required: true, min: 1, max: 713 },
    stats: { type: statsSchema, required: true },
    equipment: { type: equipmentSchema, default: () => ({}) },
    visibility: {
      type: String,
      enum: ["public", "private"],
      default: "private",
    },
  },
  {
    collection: "builds",
    timestamps: true,
    versionKey: false,
  },
);

buildSchema.index({ ownerId: 1, updatedAt: -1 });
buildSchema.index({ visibility: 1, createdAt: -1 });

export type Build = InferSchemaType<typeof buildSchema>;
export const BuildModel = model<Build>("Build", buildSchema);
