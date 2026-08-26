import { Schema } from "mongoose";
import type { DamageTypes } from "../../damage/domain/damage.types";
import type { Attributes } from "../domain/weapon.types";

export const damageTypesSchema = new Schema<DamageTypes>(
  {
    physical: { type: Number, required: true, min: 0 },
    magic: { type: Number, required: true, min: 0 },
    fire: { type: Number, required: true, min: 0 },
    lightning: { type: Number, required: true, min: 0 },
    holy: { type: Number, required: true, min: 0 },
  },
  { _id: false },
);

export const attributesSchema = new Schema<Attributes>(
  {
    strength: { type: Number, required: true, min: 0 },
    dexterity: { type: Number, required: true, min: 0 },
    intelligence: { type: Number, required: true, min: 0 },
    faith: { type: Number, required: true, min: 0 },
    arcane: { type: Number, required: true, min: 0 },
  },
  { _id: false },
);

export const sourceFields = {
  source: { type: String, required: true, enum: ["ERDB"] },
  gameVersion: { type: String, required: true },
  importedAt: { type: Date, required: true },
} as const;
