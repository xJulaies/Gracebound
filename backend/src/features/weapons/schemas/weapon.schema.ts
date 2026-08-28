import { z } from "zod";
import { WEAPON_AFFINITIES } from "../domain/weaponCatalog.types";

export const weaponIdSchema = z.strictObject({
  weaponId: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
});

export const weaponListQuerySchema = z.strictObject({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(50),
  search: z.string().trim().min(1).max(100).optional(),
  affinity: z.enum(WEAPON_AFFINITIES).optional(),
});

export type WeaponListQuery = z.infer<typeof weaponListQuerySchema>;
