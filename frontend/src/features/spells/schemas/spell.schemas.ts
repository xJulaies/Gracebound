import { z } from "zod";
import {
  assetUrlSchema,
  calculationStatusSchema,
  catalogTextSchema,
  damageTypesSchema,
  identifierSchema,
  statusResistancesSchema,
  versionSchema,
} from "../../../shared/schemas/game.schemas";
import {
  SPELL_SCHOOLS,
} from "../types/spell.types";

const spellAttackSchema = z.strictObject({
  outputUnit: z.enum(["per-hit", "per-tick"]),
  motionValues: damageTypesSchema,
  additionalComponents: z.array(z.strictObject({
    id: identifierSchema,
    label: z.string().min(1),
    outputUnit: z.enum(["per-hit", "per-tick"]),
    motionValues: damageTypesSchema,
  })),
});

export const spellSchema = z.strictObject({
  id: identifierSchema,
  name: z.string().min(1),
  summary: catalogTextSchema,
  description: catalogTextSchema,
  type: z.enum(["sorcery", "incantation"]),
  schools: z.array(z.enum(SPELL_SCHOOLS)),
  fpCost: z.number().int().nonnegative(),
  chargedFpCost: z.number().int().nonnegative().nullable(),
  sustainedFpCost: z.number().int().nonnegative().nullable(),
  slotsRequired: z.number().int().positive(),
  requirements: z.strictObject({
    intelligence: z.number().int().nonnegative(),
    faith: z.number().int().nonnegative(),
    arcane: z.number().int().nonnegative(),
  }),
  iconId: z.number().int().nonnegative(),
  iconUrl: assetUrlSchema,
  calculationStatus: calculationStatusSchema,
  buffEffect: z.strictObject({
    slot: z.enum(["aura", "body", "weapon"]),
    durationSeconds: z.number().nonnegative(),
    outgoingDamageMultipliers: damageTypesSchema,
    weaponAddedDamageScaling: damageTypesSchema,
    weaponAddedStatusBuildup: statusResistancesSchema,
    limitations: z.array(z.string()),
  }).nullable(),
  attack: spellAttackSchema.nullable(),
  chargedAttack: spellAttackSchema.nullable(),
  gameVersion: versionSchema,
});

export const spellQuerySchema = z.strictObject({
  type: z.enum(["sorcery", "incantation"]).optional(),
  school: z.enum(SPELL_SCHOOLS).optional(),
  search: z.string().trim().max(100).optional(),
  page: z.number().int().min(1).optional(),
  limit: z.number().int().min(1).max(100).optional(),
});
