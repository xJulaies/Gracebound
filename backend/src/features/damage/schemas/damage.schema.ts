import { z } from "zod";
import type { DamageTypes } from "../domain/damage.types";

const damageTypesSchema: z.ZodType<DamageTypes> = z.strictObject({
  physical: z.number().finite().nonnegative(),
  magic: z.number().finite().nonnegative(),
  fire: z.number().finite().nonnegative(),
  lightning: z.number().finite().nonnegative(),
  holy: z.number().finite().nonnegative(),
});

const absorptionSchema = z.strictObject({
  physical: z.number().finite().min(-100).max(100),
  magic: z.number().finite().min(-100).max(100),
  fire: z.number().finite().min(-100).max(100),
  lightning: z.number().finite().min(-100).max(100),
  holy: z.number().finite().min(-100).max(100),
});

const targetSchema = z.strictObject({
  defense: z.number().finite().nonnegative(),
  absorption: absorptionSchema,
});

const motionValueSchema = z.number().finite().positive().max(1000).default(100);

export const manualDamageSchema = z.strictObject({
  attackRating: damageTypesSchema,
  motionValue: motionValueSchema,
  target: targetSchema,
});

export const weaponDamageSchema = z.strictObject({
  weaponId: z.string().trim().min(1).max(100),
  upgradeLevel: z.number().int().min(0).max(25),
  stats: z.strictObject({
    strength: z.number().int().min(1).max(99),
    dexterity: z.number().int().min(1).max(99),
    intelligence: z.number().int().min(1).max(99),
    faith: z.number().int().min(1).max(99),
    arcane: z.number().int().min(1).max(99),
  }),
  motionValue: motionValueSchema,
  target: targetSchema,
});

export const calculateDamageSchema = z.union([
  manualDamageSchema,
  weaponDamageSchema,
]);

export type CalculateDamageInput = z.infer<typeof calculateDamageSchema>;
export type ManualDamageInput = z.infer<typeof manualDamageSchema>;
export type WeaponDamageInput = z.infer<typeof weaponDamageSchema>;
