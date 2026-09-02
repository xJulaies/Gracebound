import { z } from "zod";
export const crystalTearGoodsRowSchema = z.object({
  ID: z.coerce.number().int(), Name: z.string(), iconId: z.coerce.number().int(),
  goodsType: z.coerce.number().int(), refId_default: z.coerce.number().int(),
});
export type CrystalTearGoodsRow = z.infer<typeof crystalTearGoodsRowSchema>;
