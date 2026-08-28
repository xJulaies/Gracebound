import { z } from "zod";

export const bossIdSchema = z.strictObject({
  bossId: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
});
