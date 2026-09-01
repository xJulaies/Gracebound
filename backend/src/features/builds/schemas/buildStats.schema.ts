import { z } from "zod";
import { statsSchema } from "./build.schema";

export const calculateBuildStatsSchema = z.strictObject({
  characterClassId: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  stats: statsSchema,
  memoryStoneCount: z.number().int().min(0).max(8).default(0),
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
    .default([]),
  spellIds: z
    .array(z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/))
    .max(10)
    .refine((ids) => new Set(ids).size === ids.length, {
      message: "Spell IDs must be unique",
    })
    .default([]),
  catalyst: z.strictObject({
    weaponId: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
    variantId: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
    upgradeLevel: z.number().int().min(0).max(25),
  }).nullable().default(null),
});

export type CalculateBuildStatsInput = z.infer<typeof calculateBuildStatsSchema>;
