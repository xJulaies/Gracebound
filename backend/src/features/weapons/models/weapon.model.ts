import { model, Schema } from "mongoose";
import type {
  AttributeCorrection,
  WeaponCalculationData,
} from "../domain/weapon.types";
import {
  attributesSchema,
  damageTypesSchema,
  sourceFields,
} from "./gameData.schemas";

const attributeCorrectionSchema = new Schema<AttributeCorrection>(
  {
    attribute: {
      type: String,
      required: true,
      enum: [
        "strength",
        "dexterity",
        "intelligence",
        "faith",
        "arcane",
      ],
    },
    curveId: { type: String, required: true },
    influenceRatio: { type: Number, required: true },
    scalingOverride: { type: Number },
  },
  { _id: false },
);

type WeaponCorrections = WeaponCalculationData["corrections"];

const correctionsSchema = new Schema<WeaponCorrections>(
  {
    physical: { type: [attributeCorrectionSchema], required: true },
    magic: { type: [attributeCorrectionSchema], required: true },
    fire: { type: [attributeCorrectionSchema], required: true },
    lightning: { type: [attributeCorrectionSchema], required: true },
    holy: { type: [attributeCorrectionSchema], required: true },
  },
  { _id: false },
);

export type WeaponRecord = WeaponCalculationData & {
  source: "ERDB";
  importedAt: Date;
};

const weaponSchema = new Schema<WeaponRecord>(
  {
    id: { type: String, required: true },
    sourceId: { type: Number, required: true, min: 1 },
    name: { type: String, required: true },
    maxUpgradeLevel: { type: Number, required: true, min: 0, max: 25 },
    reinforcementId: { type: String, required: true },
    requirements: { type: attributesSchema, required: true },
    baseAttack: { type: damageTypesSchema, required: true },
    baseScaling: { type: attributesSchema, required: true },
    corrections: { type: correctionsSchema, required: true },
    ...sourceFields,
  },
  {
    collection: "weapons",
    versionKey: false,
  },
);

weaponSchema.index({ gameVersion: 1, id: 1 }, { unique: true });

export const WeaponModel = model<WeaponRecord>("Weapon", weaponSchema);
