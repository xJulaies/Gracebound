import { z } from "zod";
export const crystalTearIdSchema = z.strictObject({ crystalTearId: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/) });
