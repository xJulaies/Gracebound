import { model, Schema } from "mongoose";
import {
  WEAPON_AFFINITIES,
  type WeaponCatalogEntry,
  type WeaponVariantReference,
} from "../domain/weaponCatalog.types";
import type { WeaponAttackProfile } from "../domain/weaponAttack.types";
import type {
  WeaponSkillAttack,
  WeaponSkillProfile,
} from "../domain/weaponSkill.types";
import { damageTypesSchema } from "./gameData.schemas";

export type WeaponCatalogRecord = WeaponCatalogEntry & {
  source: "REGULATION";
  gameVersion: string;
  sourceHash: string;
  importedAt: Date;
};

const variantReferenceSchema = new Schema<WeaponVariantReference>(
  {
    id: { type: String, required: true },
    sourceId: { type: Number, required: true, min: 1 },
    affinity: {
      type: String,
      required: true,
      enum: WEAPON_AFFINITIES,
    },
  },
  { _id: false },
);

const weaponAttackSchema = new Schema<WeaponAttackProfile>(
  {
    id: { type: String, required: true },
    name: { type: String, required: true },
    behaviorVariationId: { type: Number, required: true, min: 0 },
    behaviorJudgeId: { type: Number, required: true, min: 0 },
    sourceBehaviorId: { type: Number, required: true, min: 0 },
    sourceAttackId: { type: Number, required: true, min: 0 },
    motionValues: { type: damageTypesSchema, required: true },
    physicalAttackType: {
      type: String,
      required: true,
      enum: ["standard", "strike", "slash", "pierce"],
    },
  },
  { _id: false },
);

const weaponSkillComponentSchema = new Schema(
  {
    kind: { type: String, required: true, enum: ["weapon-hit", "projectile"] },
    sourceBehaviorId: { type: Number, required: true, min: 0 },
    sourceAttackId: { type: Number, required: true, min: 0 },
    sourceBulletId: { type: Number, min: 0 },
    physicalAttackType: {
      type: String,
      required: true,
      enum: ["standard", "strike", "slash", "pierce"],
    },
    motionValues: { type: damageTypesSchema, required: true },
    addedDamage: { type: damageTypesSchema, required: true },
    finalDamageRates: { type: damageTypesSchema, required: true },
  },
  { _id: false },
);

const weaponSkillAttackSchema = new Schema<WeaponSkillAttack>(
  {
    id: { type: String, required: true },
    name: { type: String, required: true },
    fpCost: { type: Number, required: true, min: 0 },
    components: { type: [weaponSkillComponentSchema], required: true },
  },
  { _id: false },
);

export const weaponSkillSchema = new Schema<WeaponSkillProfile>(
  {
    id: { type: String, required: true },
    name: { type: String, required: true },
    sourceSwordArtId: { type: Number, required: true, min: 0 },
    attacks: { type: [weaponSkillAttackSchema], required: true },
  },
  { _id: false },
);

const weaponCatalogSchema = new Schema<WeaponCatalogRecord>(
  {
    id: { type: String, required: true },
    sourceId: { type: Number, required: true, min: 1 },
    name: { type: String, required: true },
    categoryId: { type: Number, required: true, min: 1 },
    weaponTypeId: { type: Number, required: true, min: 0 },
    weight: { type: Number, required: true, min: 0 },
    iconId: { type: Number, required: true, min: 0 },
    swordArtId: { type: Number, min: 0, default: null },
    canChangeAffinity: { type: Boolean, required: true },
    variants: {
      type: [variantReferenceSchema],
      required: true,
      validate: {
        validator: (variants: WeaponVariantReference[]) =>
          variants.length > 0 &&
          new Set(variants.map(({ affinity }) => affinity)).size ===
            variants.length,
        message: "Weapon variants must contain unique affinities",
      },
    },
    attacks: {
      type: [weaponAttackSchema],
      required: true,
      default: [],
      validate: {
        validator: (attacks: WeaponAttackProfile[]) =>
          new Set(attacks.map(({ id }) => id)).size === attacks.length,
        message: "Weapon attacks must contain unique IDs",
      },
    },
    skills: {
      type: [weaponSkillSchema],
      required: true,
      default: [],
      validate: {
        validator: (skills: WeaponSkillProfile[]) =>
          new Set(skills.map(({ id }) => id)).size === skills.length,
        message: "Weapon skills must contain unique IDs",
      },
    },
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
    collection: "weapons",
    versionKey: false,
  },
);

weaponCatalogSchema.index({ gameVersion: 1, id: 1 }, { unique: true });

export const WeaponCatalogModel = model<WeaponCatalogRecord>(
  "WeaponCatalog",
  weaponCatalogSchema,
);
