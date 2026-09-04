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

const attributeBonusesSchema = new Schema({
  vigor: signedNumberField(), mind: signedNumberField(), endurance: signedNumberField(), strength: signedNumberField(),
  dexterity: signedNumberField(), intelligence: signedNumberField(), faith: signedNumberField(), arcane: signedNumberField(),
}, { _id: false });

const resourceMultipliersSchema = new Schema({
  maxHp: numberField(), maxFp: numberField(), maxStamina: numberField(), maxEquipLoad: numberField(),
}, { _id: false });

const fpCostMultipliersSchema = new Schema({
  skill: numberField(), sorcery: numberField(), incantation: numberField(),
}, { _id: false });

const incomingDamageMultipliersSchema = new Schema({
  physical: numberField(), magic: numberField(), fire: numberField(), lightning: numberField(), holy: numberField(),
}, { _id: false });

const passiveResistanceSchema = new Schema({
  poison: signedNumberField(), rot: signedNumberField(), bleed: signedNumberField(), frost: signedNumberField(),
  sleep: signedNumberField(), madness: signedNumberField(), deathBlight: signedNumberField(),
}, { _id: false });

const flaskRecoveryMultipliersSchema = new Schema({
  hp: numberField(), fp: numberField(),
}, { _id: false });

const outgoingDamageMultipliersSchema = new Schema({
  physical: numberField(), magic: numberField(), fire: numberField(), lightning: numberField(), holy: numberField(),
}, { _id: false });

const conditionalAttackBoostSchema = new Schema({
  trigger: { type: String, required: true, enum: ["blood-loss-nearby", "poison-or-rot-nearby", "madness-on-wearer"] },
  durationSeconds: numberField(),
  outgoingDamageMultipliers: { type: outgoingDamageMultipliersSchema, required: true },
}, { _id: false });

const regenerationEffectSchema = new Schema({
  target: { type: String, required: true, enum: ["wearer", "nearby-allies"] },
  hpPerSecond: numberField(),
  maximumHpPercent: { type: Number, required: false, default: null, min: 0, max: 100 },
  radius: { type: Number, required: false, default: null, min: 0 },
}, { _id: false });

const armorUtilityEffectsSchema = new Schema({
  enemyHearingMultiplier: numberField(),
  aggroPriorityModifier: signedNumberField(),
  dodgeContactPhysicalDamage: numberField(),
  reducesHeadshotImpact: { type: Boolean, required: true },
}, { _id: false });

const scopedDamageBoostSchema = new Schema({
  scope: {
    type: String, required: true,
    enum: [
      "thorn-sorceries", "glintstone-weapon-skills", "ancestral-infant", "noble-presence",
      "crucible-incantations", "glintstone-stars-sorceries", "stars-of-ruin", "comet-sorceries",
      "comet-azur", "envoy-bubble-skills", "omen-bairn-tools", "cold-sorceries",
      "golden-order-incantations", "throwable-pots", "jumping-attacks", "all-physical-attacks",
    ],
  },
  damageMultipliers: { type: outgoingDamageMultipliersSchema, required: true },
}, { _id: false });

const passiveEffectsSchema = new Schema({
  attributeBonuses: { type: attributeBonusesSchema, required: true },
  resourceMultipliers: { type: resourceMultipliersSchema, required: true },
  fpCostMultipliers: { type: fpCostMultipliersSchema, required: true },
  incomingDamageMultipliers: { type: incomingDamageMultipliersSchema, required: true },
  statusResistanceBonuses: { type: passiveResistanceSchema, required: true },
  flaskRecoveryMultipliers: { type: flaskRecoveryMultipliersSchema, required: true },
  conditionalAttackBoosts: { type: [conditionalAttackBoostSchema], required: true },
  regenerationEffects: { type: [regenerationEffectSchema], required: true },
  utilityEffects: { type: armorUtilityEffectsSchema, required: true },
  scopedDamageBoosts: { type: [scopedDamageBoostSchema], required: true },
}, { _id: false });

const armorSchema = new Schema<ArmorRecord>({
  id: { type: String, required: true },
  sourceProtectorId: { type: Number, required: true, min: 1 },
  name: { type: String, required: true },
  summary: { type: String, default: null },
  description: { type: String, default: null },
  slot: { type: String, required: true, enum: ["head", "body", "arms", "legs"] },
  iconId: { type: Number, required: true, min: 0 },
  weight: { type: Number, required: true, min: 0 },
  poise: { type: Number, required: true, min: 0 },
  damageNegation: { type: damageNegationSchema, required: true },
  resistances: { type: resistanceSchema, required: true },
  sourceEffectIds: { type: [Number], required: true },
  hasUnresolvedPassiveEffects: { type: Boolean, required: true },
  passiveEffects: { type: passiveEffectsSchema, required: true },
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
