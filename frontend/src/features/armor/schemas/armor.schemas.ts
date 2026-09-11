import { z } from "zod";
import {
  assetUrlSchema,
  catalogTextSchema,
  identifierSchema,
  numericRecordSchema,
  versionSchema,
} from "../../../shared/schemas/game.schemas";

export const armorSchema = z.strictObject({
  id: identifierSchema,
  name: z.string().min(1),
  summary: catalogTextSchema,
  description: catalogTextSchema,
  slot: z.enum(["head", "body", "arms", "legs"]),
  iconId: z.number().int().nonnegative(),
  iconUrl: assetUrlSchema,
  weight: z.number().nonnegative(),
  poise: z.number().nonnegative(),
  damageNegation: numericRecordSchema,
  resistances: numericRecordSchema,
  hasPassiveEffects: z.boolean(),
  hasUnresolvedPassiveEffects: z.boolean(),
  passiveEffects: z.record(z.string(), z.unknown()),
  gameVersion: versionSchema,
});

export const armorQuerySchema = z.strictObject({
  slot: z.enum(["head", "body", "arms", "legs"]).optional(),
  search: z.string().trim().max(100).optional(),
  page: z.number().int().min(1).optional(),
  limit: z.number().int().min(1).max(100).optional(),
});
