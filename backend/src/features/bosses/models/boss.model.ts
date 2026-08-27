import { model, Schema } from "mongoose";
import { damageTypesSchema } from "../../weapons/models/gameData.schemas";
import type {
  BossAbsorption,
  BossData,
  PhysicalAbsorption,
} from "../domain/boss.types";

export type BossRecord = BossData & {
  source: "REGULATION";
  gameVersion: string;
  sourceHash: string;
  importedAt: Date;
};

const physicalAbsorptionSchema = new Schema<PhysicalAbsorption>(
  {
    standard: { type: Number, required: true, min: -100, max: 100 },
    slash: { type: Number, required: true, min: -100, max: 100 },
    strike: { type: Number, required: true, min: -100, max: 100 },
    pierce: { type: Number, required: true, min: -100, max: 100 },
  },
  { _id: false },
);

const bossAbsorptionSchema = new Schema<BossAbsorption>(
  {
    physical: { type: physicalAbsorptionSchema, required: true },
    magic: { type: Number, required: true, min: -100, max: 100 },
    fire: { type: Number, required: true, min: -100, max: 100 },
    lightning: { type: Number, required: true, min: -100, max: 100 },
    holy: { type: Number, required: true, min: -100, max: 100 },
  },
  { _id: false },
);

const bossSchema = new Schema<BossRecord>(
  {
    id: { type: String, required: true },
    name: { type: String, required: true },
    health: { type: Number, required: true, min: 1 },
    defense: { type: damageTypesSchema, required: true },
    absorption: { type: bossAbsorptionSchema, required: true },
    sourceNpcId: { type: Number, required: true, min: 1 },
    healthScalingEffectId: { type: Number, required: true, min: 0 },
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
    collection: "bosses",
    versionKey: false,
  },
);

bossSchema.index({ gameVersion: 1, id: 1 }, { unique: true });

export const BossModel = model<BossRecord>("Boss", bossSchema);
