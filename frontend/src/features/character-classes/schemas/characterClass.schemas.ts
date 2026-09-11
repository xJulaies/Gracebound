import { z } from "zod";
import {
  assetUrlSchema,
  characterStatsSchema,
  identifierSchema,
  versionSchema,
} from "../../../shared/schemas/game.schemas";

export const characterClassSchema = z.strictObject({
  id: identifierSchema,
  name: z.string().min(1),
  imageUrl: assetUrlSchema,
  level: z.number().int().min(1).max(713),
  stats: characterStatsSchema,
  gameVersion: versionSchema,
});
