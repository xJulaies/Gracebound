import { z } from "zod";
import {
  assetUrlSchema,
  calculationStatusSchema,
  catalogTextSchema,
  characterStatsSchema,
  identifierSchema,
  versionSchema,
} from "../../../shared/schemas/game.schemas";

export const greatRuneSchema = z.strictObject({
  id: identifierSchema,
  name: z.string().min(1),
  summary: catalogTextSchema,
  description: catalogTextSchema,
  iconId: z.number().int().nonnegative(),
  iconUrl: assetUrlSchema,
  activation: z.enum(["rune-arc", "not-applicable"]),
  calculationStatus: calculationStatusSchema,
  effects: z.strictObject({
    attributeBonuses: characterStatsSchema,
    resourceMultipliers: z.strictObject({
      maxHp: z.number(),
      maxFp: z.number(),
      maxStamina: z.number(),
    }),
  }).nullable(),
  limitations: z.array(z.string()),
  gameVersion: versionSchema,
});
