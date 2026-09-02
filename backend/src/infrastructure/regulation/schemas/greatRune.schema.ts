import { z } from "zod";

export const greatRuneGoodsRowSchema = z.object({
  ID: z.coerce.number().int().nonnegative(),
  Name: z.string(),
  iconId: z.coerce.number().int().nonnegative(),
  goodsType: z.coerce.number().int().nonnegative(),
});

export type GreatRuneGoodsRow = z.infer<typeof greatRuneGoodsRowSchema>;
