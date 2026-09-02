import { z } from "zod";

export const greatRuneIdSchema = z.strictObject({
  greatRuneId: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
});
