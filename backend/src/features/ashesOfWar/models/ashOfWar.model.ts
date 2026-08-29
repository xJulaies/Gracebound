import { model, Schema } from "mongoose";
import type { AshOfWarData } from "../domain/ashOfWar.types";
import { weaponSkillSchema } from "../../weapons/models/weaponCatalog.model";

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
    compatibleWeaponTypes: { type: [String], required: true },
    skill: { type: weaponSkillSchema, required: true },
    source: { type: String, required: true, enum: ["REGULATION"] },
    gameVersion: { type: String, required: true },
    sourceHash: { type: String, required: true, match: /^[a-f0-9]{64}$/ },
    importedAt: { type: Date, required: true },
  },
  { collection: "ashesOfWar", versionKey: false },
);

ashOfWarSchema.index({ gameVersion: 1, id: 1 }, { unique: true });

export const AshOfWarModel = model<AshOfWarRecord>("AshOfWar", ashOfWarSchema);
