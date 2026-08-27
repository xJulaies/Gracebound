import { model, Schema } from "mongoose";
import type { ReinforcementLevel } from "../domain/weapon.types";
import {
  attributesSchema,
  damageTypesSchema,
  sourceFields,
} from "./gameData.schemas";

const reinforcementLevelSchema = new Schema<ReinforcementLevel>(
  {
    level: { type: Number, required: true, min: 0, max: 25 },
    attackMultiplier: { type: damageTypesSchema, required: true },
    scalingMultiplier: { type: attributesSchema, required: true },
  },
  { _id: false },
);

export interface ReinforcementRecord {
  id: string;
  levels: ReinforcementLevel[];
  source: "ERDB" | "REGULATION";
  sourceHash?: string;
  gameVersion: string;
  importedAt: Date;
}

const reinforcementSchema = new Schema<ReinforcementRecord>(
  {
    id: { type: String, required: true },
    levels: {
      type: [reinforcementLevelSchema],
      required: true,
      validate: {
        validator: (levels: unknown[]) => levels.length > 0,
        message: "Reinforcement levels must not be empty",
      },
    },
    ...sourceFields,
  },
  {
    collection: "reinforcementData",
    versionKey: false,
  },
);

reinforcementSchema.index({ gameVersion: 1, id: 1 }, { unique: true });

export const ReinforcementModel = model<ReinforcementRecord>(
  "Reinforcement",
  reinforcementSchema,
);
