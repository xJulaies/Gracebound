import { z } from "zod";

export const spEffectParamRowSchema = z.object({
  ID: z.coerce.number().int().nonnegative(),
  Name: z.string(),
  maxHpRate: z.coerce.number().finite().positive(),
});

export type SpEffectParamRow = z.infer<typeof spEffectParamRowSchema>;
