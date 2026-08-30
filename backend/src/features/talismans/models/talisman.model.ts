import { model, Schema } from "mongoose";
import type { TalismanData } from "../domain/talisman.types";

export type TalismanRecord = TalismanData & {
  source: "REGULATION";
  gameVersion: string;
  sourceHash: string;
  importedAt: Date;
};

const damageTypeMultipliersSchema = new Schema(
  {
    physical: { type: Number, required: true, min: 0 },
    magic: { type: Number, required: true, min: 0 },
    fire: { type: Number, required: true, min: 0 },
    lightning: { type: Number, required: true, min: 0 },
    holy: { type: Number, required: true, min: 0 },
  },
  { _id: false },
);

const successiveAttackStageSchema = new Schema(
  {
    accumulatorThreshold: { type: Number, required: true, min: 0 },
    durationSeconds: { type: Number, required: true, min: 0 },
    damageMultipliers: { type: damageTypeMultipliersSchema, required: true },
  },
  { _id: false },
);

const talismanSchema = new Schema<TalismanRecord>(
  {
    id: { type: String, required: true },
    sourceAccessoryId: { type: Number, required: true, min: 1 },
    name: { type: String, required: true },
    iconId: { type: Number, required: true, min: 0 },
    weight: { type: Number, required: true, min: 0 },
    sourceEffectId: { type: Number, required: true, min: 0 },
    calculationStatus: {
      type: String,
      required: true,
      enum: ["catalog-only", "supported"],
    },
    effects: {
      type: new Schema(
        {
          resourceMultipliers: {
            type: new Schema(
              {
                maxHp: { type: Number, required: true, min: 0 },
                maxFp: { type: Number, required: true, min: 0 },
                maxStamina: { type: Number, required: true, min: 0 },
                maxEquipLoad: { type: Number, required: true, min: 0 },
              },
              { _id: false },
            ),
            required: true,
          },
          statusResistanceBonuses: {
            type: new Schema(
              {
                poison: { type: Number, required: true },
                rot: { type: Number, required: true },
                bleed: { type: Number, required: true },
                frost: { type: Number, required: true },
                sleep: { type: Number, required: true },
                madness: { type: Number, required: true },
                deathBlight: { type: Number, required: true },
              },
              { _id: false },
            ),
            required: true,
          },
          spellDamageMultipliers: {
            type: new Schema(
              {
                sorcery: { type: Number, required: true, min: 0 },
                incantation: { type: Number, required: true, min: 0 },
              },
              { _id: false },
            ),
            required: true,
          },
          utilityEffects: {
            type: new Schema(
              {
                itemDiscoveryRateBonus: { type: Number, required: true },
                runeAcquisitionMultiplier: { type: Number, required: true, min: 0 },
                memorySlotBonus: { type: Number, required: true },
                staminaRecoverySpeedBonus: { type: Number, required: true },
                poiseDamageMultiplier: { type: Number, required: true, min: 0 },
                skillFpCostMultiplier: { type: Number, required: true, min: 0 },
                spellFpCostMultiplier: { type: Number, required: true, min: 0 },
                spellEffectDurationMultiplier: { type: Number, required: true, min: 0 },
                castingSpeedVirtualDexterity: { type: Number, required: true },
              },
              { _id: false },
            ),
            required: true,
          },
          recoveryEffects: {
            type: new Schema(
              {
                hpFlaskRecoveryMultiplier: { type: Number, required: true, min: 0 },
                fpFlaskRecoveryMultiplier: { type: Number, required: true, min: 0 },
                hpRecoveryPerSecond: { type: Number, required: true, min: 0 },
              },
              { _id: false },
            ),
            required: true,
          },
          guardEffects: {
            type: new Schema(
              {
                staminaDamageMultiplier: { type: Number, required: true, min: 0 },
                staminaCostMultiplier: { type: Number, required: true, min: 0 },
              },
              { _id: false },
            ),
            required: true,
          },
          conditionalAttackDamageMultipliers: {
            type: new Schema(
              {
                counterattack: { type: damageTypeMultipliersSchema, required: true },
                critical: { type: damageTypeMultipliersSchema, required: true },
                finalChainAttack: { type: damageTypeMultipliersSchema, required: true },
                mounted: { type: damageTypeMultipliersSchema, required: true },
                jumping: { type: damageTypeMultipliersSchema, required: true },
                guardCounter: { type: damageTypeMultipliersSchema, required: true },
              },
              { _id: false },
            ),
            required: true,
          },
          hpConditionedDamageEffect: {
            type: new Schema(
              {
                activation: {
                  type: String,
                  enum: ["low-hp", "full-hp", null],
                  default: null,
                },
                thresholdPercent: { type: Number, default: null },
                outgoingDamageMultipliers: {
                  type: damageTypeMultipliersSchema,
                  required: true,
                },
                incomingDamageMultipliers: {
                  type: damageTypeMultipliersSchema,
                  required: true,
                },
              },
              { _id: false },
            ),
            required: true,
          },
          specializedAttackEffects: {
            type: new Schema(
              {
                projectileRangeBonus: { type: Number, required: true },
                rangedDamageMultipliers: {
                  type: damageTypeMultipliersSchema,
                  required: true,
                },
                roarAndBreathDamageMultipliers: {
                  type: damageTypeMultipliersSchema,
                  required: true,
                },
                chargedSpellAndSkillDamageMultipliers: {
                  type: damageTypeMultipliersSchema,
                  required: true,
                },
                throwablePotDamageMultipliers: {
                  type: damageTypeMultipliersSchema,
                  required: true,
                },
                perfumeDamageMultipliers: {
                  type: damageTypeMultipliersSchema,
                  required: true,
                },
              },
              { _id: false },
            ),
            required: true,
          },
          successiveAttackEffect: {
            type: new Schema(
              {
                stages: { type: [successiveAttackStageSchema], required: true },
              },
              { _id: false },
            ),
            required: true,
          },
          triggeredDamageEffect: {
            type: new Schema(
              {
                trigger: {
                  type: String,
                  enum: ["blood-loss-nearby", "poison-or-rot-nearby", null],
                  default: null,
                },
                durationSeconds: { type: Number, required: true, min: 0 },
                damageMultipliers: {
                  type: damageTypeMultipliersSchema,
                  required: true,
                },
              },
              { _id: false },
            ),
            required: true,
          },
          eventRecoveryEffect: {
            type: new Schema(
              {
                trigger: {
                  type: String,
                  enum: ["enemy-kill", "critical-hit", "successive-attacks", null],
                  default: null,
                },
                accumulatorThreshold: { type: Number, default: null },
                maxHpRecoveryPercent: { type: Number, required: true, min: 0 },
                flatHpRecovery: { type: Number, required: true, min: 0 },
                flatFpRecovery: { type: Number, required: true, min: 0 },
              },
              { _id: false },
            ),
            required: true,
          },
          miscellaneousEffects: {
            type: new Schema(
              {
                silentMovement: { type: Boolean, required: true },
                fallDamageMultiplier: { type: Number, required: true, min: 0 },
                enemyTargetPriorityModifier: { type: Number, required: true },
                preventsRuneLoss: { type: Boolean, required: true },
                appearance: {
                  type: String,
                  enum: ["host", "cooperator", null],
                  default: null,
                },
              },
              { _id: false },
            ),
            required: true,
          },
          specialDefenseEffects: {
            type: new Schema(
              {
                criticalDamageMultipliers: {
                  type: damageTypeMultipliersSchema,
                  required: true,
                },
                dodgeEffectRefreshSeconds: { type: Number, required: true, min: 0 },
                dodgeEffectDurationSeconds: { type: Number, required: true, min: 0 },
                reducesHeadshotImpact: { type: Boolean, required: true },
                concealsAtDistanceWhileCrouching: { type: Boolean, required: true },
              },
              { _id: false },
            ),
            required: true,
          },
          attributeBonuses: {
            type: new Schema(
              {
                vigor: { type: Number, required: true },
                mind: { type: Number, required: true },
                endurance: { type: Number, required: true },
                strength: { type: Number, required: true },
                dexterity: { type: Number, required: true },
                intelligence: { type: Number, required: true },
                faith: { type: Number, required: true },
                arcane: { type: Number, required: true },
              },
              { _id: false },
            ),
            required: true,
          },
          incomingDamageMultipliers: {
            type: new Schema(
              {
                physical: { type: Number, required: true, min: 0 },
                magic: { type: Number, required: true, min: 0 },
                fire: { type: Number, required: true, min: 0 },
                lightning: { type: Number, required: true, min: 0 },
                holy: { type: Number, required: true, min: 0 },
              },
              { _id: false },
            ),
            required: true,
          },
          outgoingDamageMultipliers: {
            type: new Schema(
              {
                physical: { type: Number, required: true, min: 0 },
                magic: { type: Number, required: true, min: 0 },
                fire: { type: Number, required: true, min: 0 },
                lightning: { type: Number, required: true, min: 0 },
                holy: { type: Number, required: true, min: 0 },
              },
              { _id: false },
            ),
            required: true,
          },
          skillDamageMultipliers: {
            type: new Schema(
              {
                physical: { type: Number, required: true, min: 0 },
                magic: { type: Number, required: true, min: 0 },
                fire: { type: Number, required: true, min: 0 },
                lightning: { type: Number, required: true, min: 0 },
                holy: { type: Number, required: true, min: 0 },
              },
              { _id: false },
            ),
            required: true,
          },
          chargedAttackDamageMultipliers: {
            type: new Schema(
              {
                physical: { type: Number, required: true, min: 0 },
                magic: { type: Number, required: true, min: 0 },
                fire: { type: Number, required: true, min: 0 },
                lightning: { type: Number, required: true, min: 0 },
                holy: { type: Number, required: true, min: 0 },
              },
              { _id: false },
            ),
            required: true,
          },
        },
        { _id: false },
      ),
      default: null,
    },
    source: { type: String, required: true, enum: ["REGULATION"] },
    gameVersion: { type: String, required: true },
    sourceHash: { type: String, required: true, match: /^[a-f0-9]{64}$/ },
    importedAt: { type: Date, required: true },
  },
  { collection: "talismans", versionKey: false },
);

talismanSchema.index({ gameVersion: 1, id: 1 }, { unique: true });

export const TalismanModel = model<TalismanRecord>("Talisman", talismanSchema);
