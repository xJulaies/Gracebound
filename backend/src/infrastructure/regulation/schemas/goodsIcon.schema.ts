import { z } from "zod";

export const goodsIconRowSchema = z.object({
  ID: z.coerce.number().int().nonnegative(),
  iconId: z.coerce.number().int().nonnegative(),
});

export type GoodsIconRow = z.infer<typeof goodsIconRowSchema>;
