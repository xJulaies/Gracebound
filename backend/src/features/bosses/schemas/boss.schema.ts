import { z } from "zod";
import { BOSS_LOCATION_TYPES, BOSS_REGIONS } from "../domain/boss.types";

export const bossIdSchema = z.strictObject({
  bossId: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
});

const booleanQuerySchema = z.enum(["true", "false"]).transform(
  (value) => value === "true",
);

export const bossListQuerySchema = z.strictObject({
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
  search: z.string().trim().min(1).max(100).optional(),
  region: z.enum(BOSS_REGIONS).optional(),
  locationType: z.enum(BOSS_LOCATION_TYPES).optional(),
  rank: z.enum(["major", "minor"]).optional(),
  progression: z.enum(["required", "route-dependent", "optional"]).optional(),
  rewardsGreatRune: booleanQuerySchema.optional(),
  rewardsRemembrance: booleanQuerySchema.optional(),
});

export type BossListQuery = z.infer<typeof bossListQuerySchema>;
