import { model, Schema } from "mongoose";
import type { CrystalTearData } from "../domain/crystalTear.types";

export type CrystalTearRecord = CrystalTearData & {
  source: "REGULATION"; gameVersion: string; sourceHash: string; importedAt: Date;
};

const stats = { vigor: Number, mind: Number, endurance: Number, strength: Number, dexterity: Number, intelligence: Number, faith: Number, arcane: Number };
const damage = { physical: Number, magic: Number, fire: Number, lightning: Number, holy: Number };

const crystalTearSchema = new Schema<CrystalTearRecord>({
  id: { type: String, required: true }, sourceGoodsId: { type: Number, required: true },
  sourceEffectId: { type: Number, required: true }, name: { type: String, required: true },
  iconId: { type: Number, required: true },
  calculationStatus: { type: String, required: true, enum: ["supported", "catalog-only"] },
  effects: { type: new Schema({
    durationSeconds: { type: Number, required: true },
    attributeBonuses: { type: new Schema(stats, { _id: false }), required: true },
    resourceMultipliers: { type: new Schema({ maxHp: Number, maxStamina: Number, maxEquipLoad: Number }, { _id: false }), required: true },
    outgoingDamageMultipliers: { type: new Schema(damage, { _id: false }), required: true },
    chargedAttackDamageMultipliers: { type: new Schema(damage, { _id: false }), required: true },
    incomingDamageMultipliers: { type: new Schema(damage, { _id: false }), required: true },
    fpCostMultipliers: { type: new Schema({ skill: Number, sorcery: Number, incantation: Number }, { _id: false }), required: true },
    poiseDamageMultiplier: { type: Number, required: true },
    staminaRecoverySpeedBonus: { type: Number, required: true },
    statusResistanceBonuses: { type: new Schema({ poison: Number, rot: Number, bleed: Number, frost: Number, sleep: Number, madness: Number, deathBlight: Number }, { _id: false }), required: true },
    cleansesStatusBuildup: { type: [String], required: true, default: [] },
    recovery: { type: new Schema({ instantMaxHpPercent: Number, instantMaxFpPercent: Number, hpPerSecond: Number, hpRegenerationDurationSeconds: Number }, { _id: false }), required: true },
  }, { _id: false }), default: null },
  limitations: { type: [String], default: [] }, source: { type: String, enum: ["REGULATION"], required: true },
  gameVersion: { type: String, required: true }, sourceHash: { type: String, required: true, match: /^[a-f0-9]{64}$/ },
  importedAt: { type: Date, required: true },
}, { collection: "crystalTears", versionKey: false });
crystalTearSchema.index({ gameVersion: 1, id: 1 }, { unique: true });
export const CrystalTearModel = model<CrystalTearRecord>("CrystalTear", crystalTearSchema);
