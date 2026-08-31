import { z } from "zod";

export const magicParamRowSchema = z.object({
  ID: z.coerce.number().int().nonnegative(),
  Name: z.string(),
  mp: z.coerce.number().int().nonnegative(),
  slotLength: z.coerce.number().int().nonnegative(),
  requirementIntellect: z.coerce.number().int().nonnegative(),
  requirementFaith: z.coerce.number().int().nonnegative(),
  requirementLuck: z.coerce.number().int().nonnegative(),
  iconId: z.coerce.number().int().nonnegative(),
  refCategory1: z.coerce.number().int().nonnegative().default(0),
  refId1: z.coerce.number().int().default(-1),
});

export type MagicParamRow = z.infer<typeof magicParamRowSchema>;
