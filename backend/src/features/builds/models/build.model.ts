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

const weaponSlotSchema = new Schema({
  weaponId: { type: String, required: true },
  variantId: { type: String, required: true },
  upgradeLevel: { type: Number, required: true, min: 0, max: 25 },
  ashOfWarId: { type: String, default: null },
}, { _id: false });

const equipmentSchema = new Schema(
  {
    weaponSlots: {
      type: new Schema({
        rightHand1: { type: weaponSlotSchema, default: null },
        rightHand2: { type: weaponSlotSchema, default: null },
        rightHand3: { type: weaponSlotSchema, default: null },
        leftHand1: { type: weaponSlotSchema, default: null },
        leftHand2: { type: weaponSlotSchema, default: null },
        leftHand3: { type: weaponSlotSchema, default: null },
      }, { _id: false }),
      default: () => ({}),
    },
    catalyst: {
      type: new Schema({
        weaponId: { type: String, required: true },
        variantId: { type: String, required: true },
        upgradeLevel: { type: Number, required: true, min: 0, max: 25 },
      }, { _id: false }),
      default: null,
    },
    armor: { type: armorSchema, default: () => ({}) },
    greatRuneId: { type: String, default: null },
    crystalTearIds: { type: [String], default: () => [] },
    talismanIds: { type: [String], default: () => [] },
    buffSpellIds: { type: [String], default: () => [] },
    weaponBuff: {
      type: new Schema({
        spellId: { type: String, required: true },
        catalystWeaponId: { type: String, required: true },
        catalystVariantId: { type: String, required: true },
        upgradeLevel: { type: Number, required: true, min: 0, max: 25 },
      }, { _id: false }),
      default: null,
    },
  },
  { _id: false },
);

const buildSchema = new Schema(
  {
    ownerId: { type: String, required: true },
    name: { type: String, required: true, trim: true, maxlength: 80 },
    description: { type: String, trim: true, maxlength: 1000, default: "" },
    characterClassId: { type: String, default: null },
    level: { type: Number, required: true, min: 1, max: 713 },
    stats: { type: statsSchema, required: true },
    memoryStoneCount: { type: Number, required: true, min: 0, max: 8, default: 0 },
    spellIds: { type: [String], required: true, default: () => [] },
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
