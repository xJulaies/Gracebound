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

export const ashOfWarSchema = z.strictObject({
  id: identifierSchema,
  name: z.string().min(1),
  summary: catalogTextSchema,
  description: catalogTextSchema,
  iconId: z.number().int().nonnegative(),
  iconUrl: assetUrlSchema,
  compatibleWeaponTypes: z.array(z.string().min(1)),
  compatibleAffinities: z.array(z.string().min(1)),
  calculationStatus: calculationStatusSchema,
  buffEffect: z.strictObject({
    durationSeconds: z.number().nonnegative(),
    consumption: z.enum(["duration", "next-hit"]),
    attackPowerMultipliers: damageTypesSchema,
    outgoingDamageMultipliers: damageTypesSchema,
    addedDamage: damageTypesSchema,
    addedStatusBuildup: statusResistancesSchema,
    poiseDamageMultiplier: z.number().nonnegative(),
    limitations: z.array(z.string()),
  }).nullable(),
  attacks: z.array(z.strictObject({
    id: identifierSchema,
    name: z.string().min(1),
    fpCost: z.number().nonnegative(),
  })),
  gameVersion: versionSchema,
});

export const ashOfWarQuerySchema = z.strictObject({
  weaponType: z.string().trim().max(80).optional(),
  affinity: z.string().trim().max(80).optional(),
});
