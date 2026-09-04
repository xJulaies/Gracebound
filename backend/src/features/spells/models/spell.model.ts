import { model, Schema } from "mongoose";
import type { SpellData } from "../domain/spell.types";
import { damageTypesSchema } from "../../weapons/models/gameData.schemas";

const statusBuildupSchema = new Schema({
  poison: { type: Number, required: true, min: 0 },
  rot: { type: Number, required: true, min: 0 },
  bleed: { type: Number, required: true, min: 0 },
  frost: { type: Number, required: true, min: 0 },
  sleep: { type: Number, required: true, min: 0 },
  madness: { type: Number, required: true, min: 0 },
  deathBlight: { type: Number, required: true, min: 0 },
}, { _id: false });

const spellAttackComponentSchema = new Schema({
  id: { type: String, required: true },
  label: { type: String, required: true },
  outputUnit: { type: String, required: true, enum: ["per-hit", "per-tick"] },
  sourceBulletId: { type: Number, required: true, min: 0 },
  sourceAttackId: { type: Number, required: true, min: 0 },
  motionValues: { type: damageTypesSchema, required: true },
  finalDamageRates: { type: damageTypesSchema, required: true },
  statusBuildup: { type: statusBuildupSchema, required: true },
}, { _id: false });

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
  summary: { type: String, default: null },
  description: { type: String, default: null },
  type: { type: String, required: true, enum: ["sorcery", "incantation"] },
  fpCost: { type: Number, required: true, min: 0 },
  chargedFpCost: { type: Number, min: 0, default: null },
  sustainedFpCost: { type: Number, min: 0, default: null },
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
  buffEffect: {
    type: new Schema({
      slot: { type: String, required: true, enum: ["aura", "body", "weapon"] },
      durationSeconds: { type: Number, required: true, min: 0 },
      outgoingDamageMultipliers: { type: damageTypesSchema, required: true },
      weaponAddedDamageScaling: { type: damageTypesSchema, required: true },
      weaponAddedStatusBuildup: { type: statusBuildupSchema, required: true },
      limitations: { type: [String], required: true, default: [] },
    }, { _id: false }),
    default: null,
  },
  attack: {
    type: new Schema({
      id: { type: String, required: true },
      label: { type: String, required: true },
      outputUnit: { type: String, required: true, enum: ["per-hit", "per-tick"] },
      sourceBulletId: { type: Number, required: true, min: 0 },
      sourceAttackId: { type: Number, required: true, min: 0 },
      motionValues: { type: damageTypesSchema, required: true },
      finalDamageRates: { type: damageTypesSchema, required: true },
      statusBuildup: { type: statusBuildupSchema, required: true },
      additionalComponents: { type: [spellAttackComponentSchema], required: true, default: [] },
    }, { _id: false }),
    default: null,
  },
  chargedAttack: {
    type: new Schema({
      id: { type: String, required: true },
      label: { type: String, required: true },
      outputUnit: { type: String, required: true, enum: ["per-hit", "per-tick"] },
      sourceBulletId: { type: Number, required: true, min: 0 },
      sourceAttackId: { type: Number, required: true, min: 0 },
      motionValues: { type: damageTypesSchema, required: true },
      finalDamageRates: { type: damageTypesSchema, required: true },
      statusBuildup: { type: statusBuildupSchema, required: true },
      additionalComponents: { type: [spellAttackComponentSchema], required: true, default: [] },
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
