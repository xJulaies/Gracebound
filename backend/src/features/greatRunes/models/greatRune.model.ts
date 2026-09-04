import { model, Schema } from "mongoose";
import type { GreatRuneData } from "../domain/greatRune.types";

export type GreatRuneRecord = GreatRuneData & {
  source: "REGULATION";
  gameVersion: string;
  sourceHash: string;
  importedAt: Date;
};

const attributeBonusesSchema = new Schema({
  vigor: { type: Number, required: true }, mind: { type: Number, required: true },
  endurance: { type: Number, required: true }, strength: { type: Number, required: true },
  dexterity: { type: Number, required: true }, intelligence: { type: Number, required: true },
  faith: { type: Number, required: true }, arcane: { type: Number, required: true },
}, { _id: false });

const greatRuneSchema = new Schema<GreatRuneRecord>({
  id: { type: String, required: true },
  sourceGoodsId: { type: Number, required: true, min: 1 },
  sourceEffectId: { type: Number, min: 0, default: null },
  name: { type: String, required: true },
  summary: { type: String, default: null },
  description: { type: String, default: null },
  iconId: { type: Number, required: true, min: 0 },
  activation: { type: String, required: true, enum: ["rune-arc", "not-applicable"] },
  calculationStatus: { type: String, required: true, enum: ["supported", "catalog-only"] },
  effects: {
    type: new Schema({
      attributeBonuses: { type: attributeBonusesSchema, required: true },
      resourceMultipliers: {
        type: new Schema({
          maxHp: { type: Number, required: true, min: 0 },
          maxFp: { type: Number, required: true, min: 0 },
          maxStamina: { type: Number, required: true, min: 0 },
        }, { _id: false }),
        required: true,
      },
    }, { _id: false }),
    default: null,
  },
  limitations: { type: [String], required: true, default: [] },
  source: { type: String, required: true, enum: ["REGULATION"] },
  gameVersion: { type: String, required: true },
  sourceHash: { type: String, required: true, match: /^[a-f0-9]{64}$/ },
  importedAt: { type: Date, required: true },
}, { collection: "greatRunes", versionKey: false });

greatRuneSchema.index({ gameVersion: 1, id: 1 }, { unique: true });

export const GreatRuneModel = model<GreatRuneRecord>("GreatRune", greatRuneSchema);
