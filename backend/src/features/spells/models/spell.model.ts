import { model, Schema } from "mongoose";
import type { SpellData } from "../domain/spell.types";
import { damageTypesSchema } from "../../weapons/models/gameData.schemas";

export type SpellRecord = SpellData & {
  source: "REGULATION";
  gameVersion: string;
  sourceHash: string;
  importedAt: Date;
};

const spellSchema = new Schema<SpellRecord>({
  id: { type: String, required: true },
  sourceMagicId: { type: Number, required: true, min: 0 },
  name: { type: String, required: true },
  type: { type: String, required: true, enum: ["sorcery", "incantation"] },
  fpCost: { type: Number, required: true, min: 0 },
  slotsRequired: { type: Number, required: true, min: 1 },
  requirements: {
    type: new Schema({
      intelligence: { type: Number, required: true, min: 0 },
      faith: { type: Number, required: true, min: 0 },
      arcane: { type: Number, required: true, min: 0 },
    }, { _id: false }),
    required: true,
  },
  iconId: { type: Number, required: true, min: 0 },
  calculationStatus: { type: String, required: true, enum: ["catalog-only", "supported"] },
  attack: {
    type: new Schema({
      sourceBulletId: { type: Number, required: true, min: 0 },
      sourceAttackId: { type: Number, required: true, min: 0 },
      motionValues: { type: damageTypesSchema, required: true },
      finalDamageRates: { type: damageTypesSchema, required: true },
    }, { _id: false }),
    default: null,
  },
  source: { type: String, required: true, enum: ["REGULATION"] },
  gameVersion: { type: String, required: true },
  sourceHash: { type: String, required: true, match: /^[a-f0-9]{64}$/ },
  importedAt: { type: Date, required: true },
}, { collection: "spells", versionKey: false });

spellSchema.index({ gameVersion: 1, id: 1 }, { unique: true });

export const SpellModel = model<SpellRecord>("Spell", spellSchema);
