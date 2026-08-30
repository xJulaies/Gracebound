import { z } from "zod";
import { statsSchema } from "./build.schema";

export const calculateBuildStatsSchema = z.strictObject({
  characterClassId: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  stats: statsSchema,
  talismanIds: z
    .array(z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/))
    .max(4)
    .refine((ids) => new Set(ids).size === ids.length, {
      message: "Talisman IDs must be unique",
    })
    .default([]),
  armorIds: z
    .array(z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/))
    .max(4)
    .refine((ids) => new Set(ids).size === ids.length, {
      message: "Armor IDs must be unique",
    })
    .default([]),
  weaponIds: z
    .array(z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/))
    .max(6)
    .refine((ids) => new Set(ids).size === ids.length, {
      message: "Weapon IDs must be unique",
    })
    .default([]),
});

export type CalculateBuildStatsInput = z.infer<typeof calculateBuildStatsSchema>;
