import { z } from "zod";

export const iconIdParamSchema = z.object({
  iconId: z.string().regex(/^\d+$/).transform(Number).pipe(z.number().int().nonnegative()),
});

export const characterClassIdParamSchema = z.object({
  classId: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
});
