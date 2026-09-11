import { z } from "zod";
import {
  assetUrlSchema,
  damageTypesSchema,
  identifierSchema,
  versionSchema,
} from "../../../shared/schemas/game.schemas";
import { BOSS_LOCATION_TYPES, BOSS_REGIONS } from "../types/boss.types";

const physicalAbsorptionSchema = z.strictObject({
  standard: z.number(),
  slash: z.number(),
  strike: z.number(),
  pierce: z.number(),
});

const absorptionSchema = z.strictObject({
  physical: physicalAbsorptionSchema,
  magic: z.number(),
  fire: z.number(),
  lightning: z.number(),
  holy: z.number(),
});

const bossPhaseSchema = z.strictObject({
  id: identifierSchema,
  name: z.string().min(1),
  imageUrl: assetUrlSchema.nullable(),
  phaseNumber: z.number().int().positive(),
  trigger: z.union([
    z.strictObject({
      type: z.literal("health-percentage"),
      threshold: z.number().min(0).max(100),
    }),
    z.strictObject({ type: z.literal("health-depleted") }),
  ]).nullable(),
  health: z.number().int().positive(),
  defense: damageTypesSchema,
  absorption: absorptionSchema,
});

export const bossSchema = z.strictObject({
  id: identifierSchema,
  name: z.string().min(1),
  imageUrl: assetUrlSchema.nullable(),
  encounters: z.array(z.strictObject({
    region: z.enum(BOSS_REGIONS),
    location: z.string().nullable(),
    locationType: z.enum(BOSS_LOCATION_TYPES).nullable(),
  })),
  rank: z.enum(["major", "minor"]).nullable(),
  progression: z.enum(["required", "route-dependent", "optional"]).nullable(),
  rewardsGreatRune: z.boolean().nullable(),
  rewardsRemembrance: z.boolean().nullable(),
  health: z.number().int().positive(),
  defense: damageTypesSchema,
  absorption: absorptionSchema,
  phases: z.array(bossPhaseSchema).optional(),
  gameVersion: versionSchema,
});

export const bossQuerySchema = z.strictObject({
  search: z.string().trim().max(100).optional(),
  region: z.enum(BOSS_REGIONS).optional(),
  locationType: z.enum(BOSS_LOCATION_TYPES).optional(),
  rank: z.enum(["major", "minor"]).optional(),
  progression: z.enum(["required", "route-dependent", "optional"]).optional(),
  rewardsGreatRune: z.boolean().optional(),
  rewardsRemembrance: z.boolean().optional(),
  page: z.number().int().min(1).optional(),
  limit: z.number().int().min(1).max(100).optional(),
});
