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
const talismanIdsSchema = z
  .array(z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/))
  .max(4)
  .refine((ids) => new Set(ids).size === ids.length, {
    message: "Talisman IDs must be unique",
  })
  .default([]);
const armorIdsSchema = z
  .array(z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/))
  .max(4)
  .refine((ids) => new Set(ids).size === ids.length, { message: "Armor IDs must be unique" })
  .default([]);
const buffSpellIdsSchema = z
  .array(z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/))
  .max(2)
  .refine((ids) => new Set(ids).size === ids.length, { message: "Buff spell IDs must be unique" })
  .default([]);
const weaponBuffSchema = z.strictObject({
  spellId: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  catalystWeaponId: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  catalystVariantId: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  upgradeLevel: z.number().int().min(0).max(25),
}).nullable().default(null);

export const manualDamageSchema = z.strictObject({
  attackRating: damageTypesSchema,
  motionValue: motionValueSchema,
  physicalAttackType: physicalAttackTypeSchema,
  bossId: bossIdSchema,
});

const weaponDamageFields = {
  weaponId: z.string().trim().min(1).max(100),
  weaponVariantId: z.string().trim().min(1).max(100),
  upgradeLevel: z.number().int().min(0).max(25),
  stats: z.strictObject({
    strength: z.number().int().min(1).max(99),
    dexterity: z.number().int().min(1).max(99),
    intelligence: z.number().int().min(1).max(99),
    faith: z.number().int().min(1).max(99),
    arcane: z.number().int().min(1).max(99),
  }),
  bossId: bossIdSchema,
  talismanIds: talismanIdsSchema,
  armorIds: armorIdsSchema,
  buffSpellIds: buffSpellIdsSchema,
  weaponBuff: weaponBuffSchema,
  skillBuffAshOfWarId: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).nullable().default(null),
};

const spellDamageSchema = z.strictObject({
  spellId: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  catalystWeaponId: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  catalystVariantId: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  upgradeLevel: z.number().int().min(0).max(25),
  charged: z.boolean().default(false),
  stats: weaponDamageFields.stats,
  bossId: bossIdSchema,
  talismanIds: talismanIdsSchema,
  buffSpellIds: buffSpellIdsSchema,
});

const attackIdSchema = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);

export const weaponDamageSchema = z.union([
  z.strictObject({ ...weaponDamageFields, attackId: attackIdSchema }),
  z.strictObject({ ...weaponDamageFields, skillAttackId: attackIdSchema }),
  z.strictObject({
    ...weaponDamageFields,
    ashOfWarId: attackIdSchema,
    skillAttackId: attackIdSchema,
  }),
]);

export const calculateDamageSchema = z.union([
  manualDamageSchema,
  weaponDamageSchema,
  spellDamageSchema,
]);

export type CalculateDamageInput = z.infer<typeof calculateDamageSchema>;
export type ManualDamageInput = z.infer<typeof manualDamageSchema>;
export type WeaponDamageInput = z.infer<typeof weaponDamageSchema>;
export type SpellDamageInput = z.infer<typeof spellDamageSchema>;
