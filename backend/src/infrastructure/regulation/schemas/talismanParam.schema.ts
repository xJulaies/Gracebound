import { z } from "zod";

export const talismanParamRowSchema = z.object({
  ID: z.coerce.number().int().nonnegative(),
  Name: z.string(),
  refId: z.coerce.number().int().nonnegative(),
  weight: z.coerce.number().finite().nonnegative(),
  iconId: z.coerce.number().int().nonnegative(),
});

export type TalismanParamRow = z.infer<typeof talismanParamRowSchema>;
