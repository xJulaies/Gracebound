import { model, Schema } from "mongoose";
import type { AshOfWarData } from "../domain/ashOfWar.types";
import { weaponSkillSchema } from "../../weapons/models/weaponCatalog.model";
import { WEAPON_AFFINITIES } from "../../weapons/domain/weaponCatalog.types";

export type AshOfWarRecord = AshOfWarData & {
  source: "REGULATION";
  gameVersion: string;
  sourceHash: string;
  importedAt: Date;
};

const ashOfWarSchema = new Schema<AshOfWarRecord>(
  {
    id: { type: String, required: true },
    sourceGemId: { type: Number, required: true, min: 1 },
    name: { type: String, required: true },
    iconId: { type: Number, required: true, min: 0 },
    sourceSwordArtId: { type: Number, required: true, min: 0 },
    compatibleWeaponTypes: { type: [String], required: true },
    compatibleAffinities: {
      type: [String],
      required: true,
      enum: WEAPON_AFFINITIES,
    },
    calculationStatus: {
      type: String,
      required: true,
      enum: ["supported", "catalog-only"],
    },
    skill: { type: weaponSkillSchema, default: null },
    skillVariants: {
      type: [new Schema(
        {
          weaponTypes: { type: [String], required: true },
          skill: { type: weaponSkillSchema, required: true },
        },
        { _id: false },
      )],
      required: true,
      default: [],
    },
    source: { type: String, required: true, enum: ["REGULATION"] },
    gameVersion: { type: String, required: true },
    sourceHash: { type: String, required: true, match: /^[a-f0-9]{64}$/ },
    importedAt: { type: Date, required: true },
  },
  { collection: "ashesOfWar", versionKey: false },
);

ashOfWarSchema.index({ gameVersion: 1, id: 1 }, { unique: true });

export const AshOfWarModel = model<AshOfWarRecord>("AshOfWar", ashOfWarSchema);
