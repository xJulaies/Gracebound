import { model, Schema } from "mongoose";
import { damageTypesSchema } from "../../weapons/models/gameData.schemas";
import type {
  BossAbsorption,
  BossData,
  BossPhase,
  BossPhaseTrigger,
  PhysicalAbsorption,
} from "../domain/boss.types";
import { BOSS_LOCATION_TYPES, BOSS_REGIONS } from "../domain/boss.types";

export type BossRecord = BossData & {
  source: "REGULATION";
  gameVersion: string;
  sourceHash: string;
  importedAt: Date;
};

const physicalAbsorptionSchema = new Schema<PhysicalAbsorption>(
  {
    standard: { type: Number, required: true, min: -100, max: 100 },
    slash: { type: Number, required: true, min: -100, max: 100 },
    strike: { type: Number, required: true, min: -100, max: 100 },
    pierce: { type: Number, required: true, min: -100, max: 100 },
  },
  { _id: false },
);

const bossAbsorptionSchema = new Schema<BossAbsorption>(
  {
    physical: { type: physicalAbsorptionSchema, required: true },
    magic: { type: Number, required: true, min: -100, max: 100 },
    fire: { type: Number, required: true, min: -100, max: 100 },
    lightning: { type: Number, required: true, min: -100, max: 100 },
    holy: { type: Number, required: true, min: -100, max: 100 },
  },
  { _id: false },
);

const bossEncounterSchema = new Schema(
  {
    region: { type: String, enum: BOSS_REGIONS, required: true },
    location: { type: String, default: null },
    locationType: { type: String, enum: BOSS_LOCATION_TYPES, default: null },
  },
  { _id: false },
);

interface BossPhaseTriggerRecord {
  type: BossPhaseTrigger["type"];
  threshold?: number;
}

const bossPhaseTriggerSchema = new Schema<BossPhaseTriggerRecord>(
  {
    type: {
      type: String,
      enum: ["health-percentage", "health-depleted"],
      required: true,
    },
    threshold: {
      type: Number,
      min: 1,
      max: 99,
    },
  },
  { _id: false, strict: "throw" },
);

bossPhaseTriggerSchema.pre("validate", function validatePhaseTrigger() {
  if (this.type === "health-percentage" && this.threshold === undefined) {
    this.invalidate(
      "threshold",
      "health-percentage triggers must define a threshold",
    );
  }

  if (this.type === "health-depleted" && this.threshold !== undefined) {
    this.invalidate(
      "threshold",
      "health-depleted triggers must not define a threshold",
    );
  }
});

const bossPhaseSchema = new Schema<BossPhase>(
  {
    id: { type: String, required: true },
    name: { type: String, required: true },
    phaseNumber: { type: Number, required: true, min: 1 },
    trigger: { type: bossPhaseTriggerSchema, default: null },
    health: { type: Number, required: true, min: 1 },
    defense: { type: damageTypesSchema, required: true },
    absorption: { type: bossAbsorptionSchema, required: true },
  },
  { _id: false },
);

const bossSchema = new Schema<BossRecord>(
  {
    id: { type: String, required: true },
    name: { type: String, required: true },
    encounters: { type: [bossEncounterSchema], required: true, default: [] },
    rank: { type: String, enum: ["major", "minor"], default: null },
    progression: {
      type: String,
      enum: ["required", "route-dependent", "optional"],
      default: null,
    },
    rewardsGreatRune: { type: Boolean, default: null },
    rewardsRemembrance: { type: Boolean, default: null },
    health: { type: Number, required: true, min: 1 },
    defense: { type: damageTypesSchema, required: true },
    absorption: { type: bossAbsorptionSchema, required: true },
    phases: { type: [bossPhaseSchema], required: true, default: [] },
    sourceNpcId: { type: Number, required: true, min: 1 },
    healthScalingEffectId: { type: Number, required: true, min: 0 },
    source: { type: String, required: true, enum: ["REGULATION"] },
    gameVersion: { type: String, required: true },
    sourceHash: {
      type: String,
      required: true,
      match: /^[a-f0-9]{64}$/,
    },
    importedAt: { type: Date, required: true },
  },
  {
    collection: "bosses",
    versionKey: false,
  },
);

bossSchema.index({ gameVersion: 1, id: 1 }, { unique: true });

export const BossModel = model<BossRecord>("Boss", bossSchema);
