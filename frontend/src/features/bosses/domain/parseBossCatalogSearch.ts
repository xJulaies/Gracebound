import {
  BOSS_LOCATION_TYPES,
  BOSS_REGIONS,
  type BossCatalogSearch,
} from "../types/boss.types";
import { z } from "zod";

const enabledFilterSchema = z.preprocess(
  (value) => value === true || value === "true" ? true : undefined,
  z.literal(true).optional(),
);
const bossCatalogSearchSchema = z.object({
  search: z.preprocess(
    (value) => typeof value === "string" ? value.slice(0, 100) : "",
    z.string(),
  ),
  region: z.enum(BOSS_REGIONS).optional().catch(undefined),
  locationType: z.enum(BOSS_LOCATION_TYPES).optional().catch(undefined),
  rank: z.enum(["major", "minor"]).optional().catch(undefined),
  progression: z.enum(["required", "route-dependent", "optional"]).optional().catch(undefined),
  rewardsGreatRune: enabledFilterSchema,
  rewardsRemembrance: enabledFilterSchema,
});

export function parseBossCatalogSearch(search: Record<string, unknown>): BossCatalogSearch {
  return bossCatalogSearchSchema.parse(search);
}
