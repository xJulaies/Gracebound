import { z } from "zod";
import {
  assetUrlSchema,
  catalogTextSchema,
  identifierSchema,
  statusResistancesSchema,
  versionSchema,
} from "../../../shared/schemas/game.schemas";

const weaponAttributesSchema = z.strictObject({
  strength: z.number().int().nonnegative(),
  dexterity: z.number().int().nonnegative(),
  intelligence: z.number().int().nonnegative(),
  faith: z.number().int().nonnegative(),
  arcane: z.number().int().nonnegative(),
});

export const weaponSchema = z.strictObject({
  id: identifierSchema,
  name: z.string().min(1),
  summary: catalogTextSchema,
  description: catalogTextSchema,
  categoryId: z.number().int(),
  weaponTypeId: z.number().int(),
  weaponType: z.string().nullable(),
  weight: z.number().nonnegative(),
  iconId: z.number().int().nonnegative(),
  iconUrl: assetUrlSchema,
  swordArtId: z.number().int().nullable(),
  canChangeAffinity: z.boolean(),
  castingTypes: z.array(z.string().min(1)),
  requirements: weaponAttributesSchema,
  statusBuildup: statusResistancesSchema.nullable(),
  variants: z.array(z.strictObject({
    id: identifierSchema,
    affinity: z.string().min(1),
    maxUpgradeLevel: z.number().int().min(0).max(25),
    canApplyWeaponBuff: z.boolean().optional(),
  })),
  attacks: z.array(z.strictObject({
    id: identifierSchema,
    name: z.string().min(1),
  })),
  skills: z.array(z.strictObject({
    id: identifierSchema,
    name: z.string().min(1),
    summary: catalogTextSchema,
    description: catalogTextSchema,
    attacks: z.array(z.strictObject({
      id: identifierSchema,
      name: z.string().min(1),
      fpCost: z.number().nonnegative(),
    })),
  })),
  gameVersion: versionSchema,
});

export const weaponQuerySchema = z.strictObject({
  page: z.number().int().min(1).optional(),
  limit: z.number().int().min(1).max(100).optional(),
  search: z.string().trim().max(100).optional(),
  affinity: z.string().trim().max(80).optional(),
  weaponType: z.string().trim().max(80).optional(),
});
