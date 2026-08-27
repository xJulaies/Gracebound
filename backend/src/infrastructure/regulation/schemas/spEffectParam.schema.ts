import { z } from "zod";

export const spEffectParamRowSchema = z.object({
  ID: z.coerce.number().int().nonnegative(),
  Name: z.string(),
  maxHpRate: z.coerce.number().finite().positive(),
  physicsDiffenceRate: z.coerce.number().finite().positive(),
  magicDiffenceRate: z.coerce.number().finite().positive(),
  fireDiffenceRate: z.coerce.number().finite().positive(),
  thunderDiffenceRate: z.coerce.number().finite().positive(),
  darkDiffenceRate: z.coerce.number().finite().positive(),
});

export type SpEffectParamRow = z.infer<typeof spEffectParamRowSchema>;
