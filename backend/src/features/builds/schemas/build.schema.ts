import { z } from "zod";

const BUILD_VISIBILITIES = ["public", "private"] as const;

const nullableEquipmentIdSchema = z
  .string()
  .trim()
  .min(1)
  .max(100)
  .nullable();

const statsSchema = z.strictObject({
  vigor: z.number().int().min(1).max(99),
  mind: z.number().int().min(1).max(99),
  endurance: z.number().int().min(1).max(99),
  strength: z.number().int().min(1).max(99),
  dexterity: z.number().int().min(1).max(99),
  intelligence: z.number().int().min(1).max(99),
  faith: z.number().int().min(1).max(99),
  arcane: z.number().int().min(1).max(99),
});

const emptyArmor = {
  headId: null,
  chestId: null,
  armsId: null,
  legsId: null,
};

const armorSchema = z
  .strictObject({
    headId: nullableEquipmentIdSchema.default(null),
    chestId: nullableEquipmentIdSchema.default(null),
    armsId: nullableEquipmentIdSchema.default(null),
    legsId: nullableEquipmentIdSchema.default(null),
  })
  .default(emptyArmor);

const equipmentSchema = z
  .strictObject({
    primaryWeaponId: nullableEquipmentIdSchema.default(null),
    weaponUpgradeLevel: z.number().int().min(0).max(25).default(0),
    armor: armorSchema,
    talismanIds: z
      .array(z.string().trim().min(1).max(100))
      .max(4)
      .refine((ids) => new Set(ids).size === ids.length, {
        message: "Talisman IDs must be unique",
      })
      .default([]),
  })
  .superRefine((equipment, context) => {
    if (
      equipment.primaryWeaponId === null &&
      equipment.weaponUpgradeLevel !== 0
    ) {
      context.addIssue({
        code: "custom",
        message: "An upgrade level requires a selected weapon",
        path: ["weaponUpgradeLevel"],
      });
    }
  });

const nameSchema = z.string().trim().min(1).max(80);
const descriptionSchema = z.string().trim().max(1000);
const levelSchema = z.number().int().min(1).max(713);
const visibilitySchema = z.enum(BUILD_VISIBILITIES);

export const createBuildSchema = z.strictObject({
  name: nameSchema,
  description: descriptionSchema.default(""),
  level: levelSchema,
  stats: statsSchema,
  equipment: equipmentSchema.default({
    primaryWeaponId: null,
    weaponUpgradeLevel: 0,
    armor: emptyArmor,
    talismanIds: [],
  }),
  visibility: visibilitySchema.default("private"),
});

export const updateBuildSchema = z
  .strictObject({
    name: nameSchema.optional(),
    description: descriptionSchema.optional(),
    level: levelSchema.optional(),
    stats: statsSchema.optional(),
    equipment: equipmentSchema.optional(),
    visibility: visibilitySchema.optional(),
  })
  .refine((update) => Object.keys(update).length > 0, {
    message: "At least one build field must be provided",
  });

export type CreateBuildInput = z.infer<typeof createBuildSchema>;
export type UpdateBuildInput = z.infer<typeof updateBuildSchema>;
export type CreateBuildData = CreateBuildInput & { ownerId: string };
