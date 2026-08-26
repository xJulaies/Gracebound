import { z } from "zod";

const integerFromCsvSchema = z.coerce.number().int();

export const npcParamRowSchema = z.object({
  ID: integerFromCsvSchema.nonnegative(),
  Name: z.string(),
  hp: integerFromCsvSchema.nonnegative(),
  spEffectID0: integerFromCsvSchema,
  spEffectID1: integerFromCsvSchema,
  spEffectID2: integerFromCsvSchema,
  spEffectID3: integerFromCsvSchema,
  spEffectID4: integerFromCsvSchema,
  spEffectID5: integerFromCsvSchema,
  spEffectID6: integerFromCsvSchema,
  spEffectID7: integerFromCsvSchema,
});

export type NpcParamRow = z.infer<typeof npcParamRowSchema>;
