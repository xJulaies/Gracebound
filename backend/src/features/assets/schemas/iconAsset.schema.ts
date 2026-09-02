import { z } from "zod";

export const iconIdParamSchema = z.object({
  iconId: z.string().regex(/^\d+$/).transform(Number).pipe(z.number().int().nonnegative()),
});
