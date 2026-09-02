import { z } from "zod";

const BUILD_VISIBILITIES = ["public", "private"] as const;

const nullableEquipmentIdSchema = z
  .string()
  .trim()
  .min(1)
  .max(100)
  .nullable();

const equipmentIdSchema = z.string().trim().min(1).max(100);

const weaponBuffSchema = z.strictObject({
  spellId: equipmentIdSchema,
  catalystWeaponId: equipmentIdSchema,
  catalystVariantId: equipmentIdSchema,
  upgradeLevel: z.number().int().min(0).max(25),
}).nullable().default(null);

const catalystSchema = z.strictObject({
  weaponId: equipmentIdSchema,
  variantId: equipmentIdSchema,
  upgradeLevel: z.number().int().min(0).max(25),
}).nullable().default(null);

const weaponSlotSchema = z.strictObject({
  weaponId: equipmentIdSchema,
  variantId: equipmentIdSchema,
  upgradeLevel: z.number().int().min(0).max(25),
  ashOfWarId: nullableEquipmentIdSchema.default(null),
}).nullable();

const emptyWeaponSlots = {
  rightHand1: null, rightHand2: null, rightHand3: null,
  leftHand1: null, leftHand2: null, leftHand3: null,
};

const weaponSlotsSchema = z.strictObject({
  rightHand1: weaponSlotSchema.default(null),
  rightHand2: weaponSlotSchema.default(null),
  rightHand3: weaponSlotSchema.default(null),
  leftHand1: weaponSlotSchema.default(null),
  leftHand2: weaponSlotSchema.default(null),
  leftHand3: weaponSlotSchema.default(null),
}).default(emptyWeaponSlots);

export const statsSchema = z.strictObject({
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
    weaponSlots: weaponSlotsSchema,
    catalyst: catalystSchema,
    armor: armorSchema,
    greatRuneId: nullableEquipmentIdSchema.default(null),
    crystalTearIds: z.array(equipmentIdSchema)
      .max(2)
      .refine((ids) => new Set(ids).size === ids.length, { message: "Crystal Tear IDs must be unique" })
      .default([]),
    talismanIds: z
      .array(z.string().trim().min(1).max(100))
      .max(4)
      .refine((ids) => new Set(ids).size === ids.length, {
        message: "Talisman IDs must be unique",
      })
      .default([]),
    buffSpellIds: z.array(equipmentIdSchema)
      .max(2)
      .refine((ids) => new Set(ids).size === ids.length, {
        message: "Buff spell IDs must be unique",
      })
      .default([]),
    weaponBuff: weaponBuffSchema,
  })
  .superRefine((equipment, context) => {
    if (Object.values(equipment.weaponSlots).every((slot) => slot === null) && equipment.weaponBuff !== null) {
      context.addIssue({
        code: "custom",
        message: "A weapon buff requires a selected weapon",
        path: ["weaponBuff"],
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
  characterClassId: nullableEquipmentIdSchema.default(null),
  level: levelSchema,
  stats: statsSchema,
  memoryStoneCount: z.number().int().min(0).max(8).default(0),
  spellIds: z.array(equipmentIdSchema)
    .max(10)
    .refine((ids) => new Set(ids).size === ids.length, { message: "Spell IDs must be unique" })
    .default([]),
  equipment: equipmentSchema.default({
    weaponSlots: emptyWeaponSlots,
    catalyst: null,
    armor: emptyArmor,
    greatRuneId: null,
    crystalTearIds: [],
    talismanIds: [],
    buffSpellIds: [],
    weaponBuff: null,
  }),
  visibility: visibilitySchema.default("private"),
});

export const updateBuildSchema = z
  .strictObject({
    name: nameSchema.optional(),
    description: descriptionSchema.optional(),
    characterClassId: nullableEquipmentIdSchema.optional(),
    level: levelSchema.optional(),
    stats: statsSchema.optional(),
    memoryStoneCount: z.number().int().min(0).max(8).optional(),
    spellIds: z.array(equipmentIdSchema)
      .max(10)
      .refine((ids) => new Set(ids).size === ids.length, { message: "Spell IDs must be unique" })
      .optional(),
    equipment: equipmentSchema.optional(),
    visibility: visibilitySchema.optional(),
  })
  .refine((update) => Object.keys(update).length > 0, {
    message: "At least one build field must be provided",
  });

export type CreateBuildInput = z.infer<typeof createBuildSchema>;
export type UpdateBuildInput = z.infer<typeof updateBuildSchema>;
export type CreateBuildData = CreateBuildInput & { ownerId: string };

const attackIdSchema = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
const bossIdSchema = attackIdSchema.optional();
export const weaponSlotIdSchema = z.enum([
  "rightHand1", "rightHand2", "rightHand3", "leftHand1", "leftHand2", "leftHand3",
]);

export const savedBuildDamageSchema = z.union([
  z.strictObject({ weaponSlotId: weaponSlotIdSchema, attackId: attackIdSchema, skillBuffActive: z.boolean().default(false), bossId: bossIdSchema }),
  z.strictObject({ weaponSlotId: weaponSlotIdSchema, skillAttackId: attackIdSchema, skillBuffActive: z.boolean().default(false), bossId: bossIdSchema }),
  z.strictObject({ spellId: attackIdSchema, charged: z.boolean().default(false), bossId: bossIdSchema }),
]);

export type SavedBuildDamageInput = z.infer<typeof savedBuildDamageSchema>;
