import { z } from "zod";

export const buildIdSchema = z.strictObject({
  buildId: z.string().regex(/^[a-f\d]{24}$/i),
});
