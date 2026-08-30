import { model, Schema } from "mongoose";
import type { CharacterClassData } from "../domain/characterClass.types";

export type CharacterClassRecord = CharacterClassData & {
  source: "REGULATION";
  gameVersion: string;
  sourceHash: string;
  importedAt: Date;
};

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

const characterClassSchema = new Schema<CharacterClassRecord>(
  {
    id: { type: String, required: true },
    name: { type: String, required: true },
    level: { type: Number, required: true, min: 1 },
    stats: { type: statsSchema, required: true },
    source: { type: String, required: true, enum: ["REGULATION"] },
    gameVersion: { type: String, required: true },
    sourceHash: { type: String, required: true, match: /^[a-f0-9]{64}$/ },
    importedAt: { type: Date, required: true },
  },
  { collection: "characterClasses", versionKey: false },
);

characterClassSchema.index({ gameVersion: 1, id: 1 }, { unique: true });

export const CharacterClassModel = model<CharacterClassRecord>(
  "CharacterClass",
  characterClassSchema,
);
