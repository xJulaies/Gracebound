import { z } from "zod";
import {
  assetUrlSchema,
  calculationStatusSchema,
  catalogTextSchema,
  identifierSchema,
  versionSchema,
} from "../../../shared/schemas/game.schemas";

export const talismanSchema = z.strictObject({
  id: identifierSchema,
  name: z.string().min(1),
  summary: catalogTextSchema,
  description: catalogTextSchema,
  iconId: z.number().int().nonnegative(),
  iconUrl: assetUrlSchema,
  weight: z.number().nonnegative(),
  calculationStatus: calculationStatusSchema,
  effects: z.record(z.string(), z.unknown()).nullable(),
  gameVersion: versionSchema,
});

export const talismanQuerySchema = z.strictObject({
  search: z.string().trim().max(100).optional(),
  page: z.number().int().min(1).optional(),
  limit: z.number().int().min(1).max(100).optional(),
  calculationStatus: calculationStatusSchema.optional(),
});
