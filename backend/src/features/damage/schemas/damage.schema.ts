import { z } from "zod";
import type { DamageTypes } from "../domain/damage.types";

const damageTypesSchema: z.ZodType<DamageTypes> = z.strictObject({
  physical: z.number().finite().nonnegative(),
  magic: z.number().finite().nonnegative(),
  fire: z.number().finite().nonnegative(),
  lightning: z.number().finite().nonnegative(),
  holy: z.number().finite().nonnegative(),
});

const physicalAttackTypeSchema = z
  .enum(["standard", "slash", "strike", "pierce"])
  .default("standard");

const motionValueSchema = z.number().finite().positive().max(1000).default(100);
const bossIdSchema = z
  .string()
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
  .optional();

export const manualDamageSchema = z.strictObject({
  attackRating: damageTypesSchema,
  motionValue: motionValueSchema,
  physicalAttackType: physicalAttackTypeSchema,
  bossId: bossIdSchema,
});

const weaponDamageFields = {
  weaponId: z.string().trim().min(1).max(100),
  upgradeLevel: z.number().int().min(0).max(25),
  stats: z.strictObject({
    strength: z.number().int().min(1).max(99),
    dexterity: z.number().int().min(1).max(99),
    intelligence: z.number().int().min(1).max(99),
    faith: z.number().int().min(1).max(99),
    arcane: z.number().int().min(1).max(99),
  }),
  bossId: bossIdSchema,
};

const attackIdSchema = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);

export const weaponDamageSchema = z.union([
  z.strictObject({ ...weaponDamageFields, attackId: attackIdSchema }),
  z.strictObject({ ...weaponDamageFields, skillAttackId: attackIdSchema }),
]);

export const calculateDamageSchema = z.union([
  manualDamageSchema,
  weaponDamageSchema,
]);

export type CalculateDamageInput = z.infer<typeof calculateDamageSchema>;
export type ManualDamageInput = z.infer<typeof manualDamageSchema>;
export type WeaponDamageInput = z.infer<typeof weaponDamageSchema>;
