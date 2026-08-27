import { model, Schema } from "mongoose";
import type { ScalingCurve } from "../domain/weapon.types";
import { sourceFields } from "./gameData.schemas";

export type ScalingCurveRecord = ScalingCurve & {
  source: "ERDB" | "REGULATION";
  sourceHash?: string;
  gameVersion: string;
  importedAt: Date;
};

const scalingCurveSchema = new Schema<ScalingCurveRecord>(
  {
    id: { type: String, required: true },
    values: {
      type: [Number],
      required: true,
      validate: {
        validator: (values: number[]) =>
          values.length === 151 && values.every(Number.isFinite),
        message: "Scaling curve must contain 151 finite values",
      },
    },
    ...sourceFields,
  },
  {
    collection: "scalingCurves",
    versionKey: false,
  },
);

scalingCurveSchema.index({ gameVersion: 1, id: 1 }, { unique: true });

export const ScalingCurveModel = model<ScalingCurveRecord>(
  "ScalingCurve",
  scalingCurveSchema,
);
