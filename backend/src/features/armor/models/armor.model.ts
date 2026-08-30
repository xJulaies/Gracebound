import { model, Schema } from "mongoose";
import type { ArmorData } from "../domain/armor.types";

export type ArmorRecord = ArmorData & {
  source: "REGULATION";
  gameVersion: string;
  sourceHash: string;
  importedAt: Date;
};

const damageNegationSchema = new Schema({
  physical: signedNumberField(), strike: signedNumberField(), slash: signedNumberField(), pierce: signedNumberField(),
  magic: signedNumberField(), fire: signedNumberField(), lightning: signedNumberField(), holy: signedNumberField(),
}, { _id: false });

const resistanceSchema = new Schema({
  poison: numberField(), rot: numberField(), bleed: numberField(), frost: numberField(),
  sleep: numberField(), madness: numberField(), deathBlight: numberField(),
}, { _id: false });

const armorSchema = new Schema<ArmorRecord>({
  id: { type: String, required: true },
  sourceProtectorId: { type: Number, required: true, min: 1 },
  name: { type: String, required: true },
  slot: { type: String, required: true, enum: ["head", "body", "arms", "legs"] },
  iconId: { type: Number, required: true, min: 0 },
  weight: { type: Number, required: true, min: 0 },
  poise: { type: Number, required: true, min: 0 },
  damageNegation: { type: damageNegationSchema, required: true },
  resistances: { type: resistanceSchema, required: true },
  sourceEffectIds: { type: [Number], required: true },
  source: { type: String, required: true, enum: ["REGULATION"] },
  gameVersion: { type: String, required: true },
  sourceHash: { type: String, required: true, match: /^[a-f0-9]{64}$/ },
  importedAt: { type: Date, required: true },
}, { collection: "armor", versionKey: false });

armorSchema.index({ gameVersion: 1, id: 1 }, { unique: true });

export const ArmorModel = model<ArmorRecord>("Armor", armorSchema);

function numberField() {
  return { type: Number, required: true, min: 0 };
}

function signedNumberField() {
  return { type: Number, required: true };
}
