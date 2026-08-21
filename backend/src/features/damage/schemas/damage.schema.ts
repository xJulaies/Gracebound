import { z } from "zod";

const damageTypesSchema = z.strictObject({
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

export const calculateDamageSchema = z.strictObject({
  attackRating: damageTypesSchema,
  motionValue: z.number().finite().positive().max(1000).default(100),
  target: z.strictObject({
    defense: z.number().finite().nonnegative(),
    absorption: absorptionSchema,
  }),
});

export type CalculateDamageInput = z.infer<typeof calculateDamageSchema>;
export type DamageTypes = z.infer<typeof damageTypesSchema>;

