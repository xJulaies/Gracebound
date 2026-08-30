import { model, Schema } from "mongoose";
import type { CharacterProgressionCurves } from "../../builds/domain/characterResources.types";

export type CharacterProgressionRecord = {
  id: "character-resources";
  curves: CharacterProgressionCurves;
  source: "REGULATION";
  gameVersion: string;
  sourceHash: string;
  importedAt: Date;
};

const curveField = {
  type: [Number],
  required: true,
  validate: {
    validator: (values: number[]) => values.length === 100 && values.every(Number.isFinite),
    message: "Character resource curve must contain 100 finite values",
  },
};

const progressionCurveField = {
  type: [Number],
  required: true,
  validate: {
    validator: (values: number[]) => values.length === 793 && values.every(Number.isFinite),
    message: "Progression curve must contain 793 finite values",
  },
};

const statusCurvesSchema = new Schema({
  poison: progressionCurveField,
  rot: progressionCurveField,
  bleed: progressionCurveField,
  frost: progressionCurveField,
  sleep: progressionCurveField,
  madness: progressionCurveField,
  deathBlight: progressionCurveField,
}, { _id: false });

const characterProgressionSchema = new Schema<CharacterProgressionRecord>({
  id: { type: String, required: true, enum: ["character-resources"] },
  curves: {
    type: new Schema({
      maxHp: curveField,
      maxFp: curveField,
      maxStamina: curveField,
      maxEquipLoad: curveField,
      levelDefense: progressionCurveField,
      physicalDefense: progressionCurveField,
      magicDefense: progressionCurveField,
      fireDefense: progressionCurveField,
      holyDefense: progressionCurveField,
      itemDiscovery: progressionCurveField,
      statusLevel: { type: statusCurvesSchema, required: true },
      statusAttribute: { type: statusCurvesSchema, required: true },
    }, { _id: false }),
    required: true,
  },
  source: { type: String, required: true, enum: ["REGULATION"] },
  gameVersion: { type: String, required: true },
  sourceHash: { type: String, required: true, match: /^[a-f0-9]{64}$/ },
  importedAt: { type: Date, required: true },
}, { collection: "characterProgression", versionKey: false });

characterProgressionSchema.index({ gameVersion: 1, id: 1 }, { unique: true });

export const CharacterProgressionModel = model<CharacterProgressionRecord>(
  "CharacterProgression",
  characterProgressionSchema,
);
