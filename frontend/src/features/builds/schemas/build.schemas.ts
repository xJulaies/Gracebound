import { z } from "zod";
import {
  characterStatsSchema,
  damageTypesSchema,
  statusResistancesSchema,
} from "../../../shared/schemas/game.schemas";
import type { BuildWriteInput } from "../types/build.types";
import type {
  BuildEditorDraft,
  BuildEditorMetadata,
} from "../types/editor.types";

const equipmentIdSchema = z.string().trim().min(1).max(100);
const nullableEquipmentIdSchema = equipmentIdSchema.nullable();
export const buildIdSchema = equipmentIdSchema;

export const buildEditorMetadataSchema = z.strictObject({
  name: z.string()
    .trim()
    .min(1, "Give this build a name before saving.")
    .max(80, "The build name must not exceed 80 characters."),
  description: z.string()
    .trim()
    .max(1000, "The build description must not exceed 1,000 characters."),
  visibility: z.enum(["public", "private"], {
    error: "Choose whether this build is public or private.",
  }),
});

export const buildStatsSchema = z.strictObject({
  vigor: z.number().int().min(1).max(99),
  mind: z.number().int().min(1).max(99),
  endurance: z.number().int().min(1).max(99),
  strength: z.number().int().min(1).max(99),
  dexterity: z.number().int().min(1).max(99),
  intelligence: z.number().int().min(1).max(99),
  faith: z.number().int().min(1).max(99),
  arcane: z.number().int().min(1).max(99),
});

const weaponSelectionSchema = z.strictObject({
  weaponId: equipmentIdSchema,
  variantId: equipmentIdSchema,
  upgradeLevel: z.number().int().min(0).max(25),
  ashOfWarId: nullableEquipmentIdSchema,
});

const catalystSelectionSchema = z.strictObject({
  weaponId: equipmentIdSchema,
  variantId: equipmentIdSchema,
  upgradeLevel: z.number().int().min(0).max(25),
});

const weaponBuffSelectionSchema = z.strictObject({
  spellId: equipmentIdSchema,
  catalystWeaponId: equipmentIdSchema,
  catalystVariantId: equipmentIdSchema,
  upgradeLevel: z.number().int().min(0).max(25),
});

const apiWeaponSlotsSchema = z.strictObject({
  rightHand1: weaponSelectionSchema.nullable(),
  rightHand2: weaponSelectionSchema.nullable(),
  rightHand3: weaponSelectionSchema.nullable(),
  leftHand1: weaponSelectionSchema.nullable(),
  leftHand2: weaponSelectionSchema.nullable(),
  leftHand3: weaponSelectionSchema.nullable(),
});

const editorWeaponSlotsSchema = z.strictObject({
  "right-hand-1": weaponSelectionSchema.nullable(),
  "right-hand-2": weaponSelectionSchema.nullable(),
  "right-hand-3": weaponSelectionSchema.nullable(),
  "left-hand-1": weaponSelectionSchema.nullable(),
  "left-hand-2": weaponSelectionSchema.nullable(),
  "left-hand-3": weaponSelectionSchema.nullable(),
});

const apiArmorSchema = z.strictObject({
  headId: nullableEquipmentIdSchema,
  chestId: nullableEquipmentIdSchema,
  armsId: nullableEquipmentIdSchema,
  legsId: nullableEquipmentIdSchema,
});

const editorArmorSchema = z.strictObject({
  "armor-head": nullableEquipmentIdSchema,
  "armor-body": nullableEquipmentIdSchema,
  "armor-arms": nullableEquipmentIdSchema,
  "armor-legs": nullableEquipmentIdSchema,
});

const uniqueEquipmentIdsSchema = (maximum: number, label: string) =>
  z.array(equipmentIdSchema)
    .max(maximum)
    .refine((ids) => new Set(ids).size === ids.length, {
      message: `${label} must be unique.`,
    });

const equipmentSchema = z.strictObject({
  weaponSlots: apiWeaponSlotsSchema,
  catalyst: catalystSelectionSchema.nullable(),
  armor: apiArmorSchema,
  greatRuneId: nullableEquipmentIdSchema,
  crystalTearIds: uniqueEquipmentIdsSchema(2, "Crystal Tears"),
  talismanIds: uniqueEquipmentIdsSchema(4, "Talismans"),
  buffSpellIds: uniqueEquipmentIdsSchema(2, "Buff spells"),
  weaponBuff: weaponBuffSelectionSchema.nullable(),
}).superRefine((equipment, context) => {
  const hasWeapon = Object.values(equipment.weaponSlots).some(Boolean);
  if (!hasWeapon && equipment.weaponBuff) {
    context.addIssue({
      code: "custom",
      message: "A weapon buff requires a selected weapon.",
      path: ["weaponBuff"],
    });
  }
});

const buildCoreShape = {
  characterClassId: nullableEquipmentIdSchema,
  level: z.number().int().min(1).max(713),
  stats: buildStatsSchema,
  memoryStoneCount: z.number().int().min(0).max(8),
  spellIds: uniqueEquipmentIdsSchema(12, "Spells"),
};

export const buildWriteInputSchema = z.strictObject({
  ...buildEditorMetadataSchema.shape,
  ...buildCoreShape,
  equipment: equipmentSchema,
});

export const buildSchema = z.strictObject({
  id: equipmentIdSchema,
  gameVersion: z.string().trim().min(1).max(30),
  ...buildWriteInputSchema.shape,
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const buildStatsInputSchema = z.strictObject({
  characterClassId: equipmentIdSchema,
  stats: buildStatsSchema,
  talismanIds: uniqueEquipmentIdsSchema(4, "Talismans"),
  armorIds: uniqueEquipmentIdsSchema(4, "Armor selections"),
  weaponIds: uniqueEquipmentIdsSchema(6, "Weapons"),
  greatRuneId: nullableEquipmentIdSchema,
  crystalTearIds: uniqueEquipmentIdsSchema(2, "Crystal Tears"),
  memoryStoneCount: z.number().int().min(0).max(8),
  spellIds: uniqueEquipmentIdsSchema(12, "Spells"),
  catalyst: catalystSelectionSchema.nullable(),
});

const resourcesSchema = z.strictObject({
  maxHp: z.number(),
  maxFp: z.number(),
  maxStamina: z.number(),
  maxEquipLoad: z.number(),
});

// The stats endpoint exposes additional diagnostic effect aggregates that the
// editor does not consume. Validate every field the UI relies on while allowing
// the backend to add those diagnostics without breaking the editor contract.
export const buildStatsPreviewSchema = z.looseObject({
  stats: buildStatsSchema,
  effectiveStats: characterStatsSchema,
  baseResources: resourcesSchema,
  resources: resourcesSchema,
  defenses: damageTypesSchema,
  baseStatusResistances: statusResistancesSchema,
  statusResistances: statusResistancesSchema,
  itemDiscovery: z.number(),
  characterClass: z.strictObject({
    id: equipmentIdSchema,
    name: z.string().min(1),
    startingLevel: z.number().int().min(1).max(713),
  }),
  characterLevel: z.number().int().min(1).max(713),
  nextLevelRuneCost: z.number().int().nonnegative().nullable(),
  totalRuneCost: z.number().int().nonnegative(),
  equipmentLoad: z.strictObject({
    currentLoad: z.number().nonnegative(),
    maxEquipLoad: z.number().positive(),
    loadRatio: z.number().nonnegative(),
    loadPercentage: z.number().nonnegative(),
    category: z.enum(["light", "medium", "heavy", "overloaded"]),
  }),
  armorStats: z.looseObject({
    equipmentWeight: z.number().nonnegative(),
    poise: z.number().nonnegative(),
    damageNegation: z.record(z.string(), z.number()),
    hasUnresolvedPassiveEffects: z.boolean(),
  }),
  damageNegation: z.record(z.string(), z.number()),
  memorySlots: z.strictObject({
    availableSlots: z.number().int().nonnegative(),
    usedSlots: z.number().int().nonnegative(),
    remainingSlots: z.number().int().nonnegative(),
  }),
  catalyst: catalystSelectionSchema.extend({
    name: z.string().min(1),
    castingTypes: z.array(z.enum(["sorcery", "incantation"])),
    scaling: damageTypesSchema,
  }).nullable(),
  spells: z.array(z.strictObject({
    id: equipmentIdSchema,
    name: z.string().min(1),
    type: z.enum(["sorcery", "incantation"]),
    fpCost: z.number().int().nonnegative(),
    slotsRequired: z.number().int().positive(),
    requirements: z.strictObject({
      intelligence: z.number().int().nonnegative(),
      faith: z.number().int().nonnegative(),
      arcane: z.number().int().nonnegative(),
    }),
    calculationStatus: z.enum(["catalog-only", "supported"]),
  })),
});

export const buildListQuerySchema = z.strictObject({
  page: z.number().int().min(1).max(100_000).optional(),
  limit: z.number().int().min(1).max(100).optional(),
  visibility: z.enum(["public", "private"]).optional(),
});

const damageStatsSchema = z.strictObject({
  strength: z.number().int().min(1).max(99),
  dexterity: z.number().int().min(1).max(99),
  intelligence: z.number().int().min(1).max(99),
  faith: z.number().int().min(1).max(99),
  arcane: z.number().int().min(1).max(99),
});

const previewEquipmentShape = {
  talismanIds: uniqueEquipmentIdsSchema(4, "Talismans"),
  greatRuneId: nullableEquipmentIdSchema,
  crystalTearIds: uniqueEquipmentIdsSchema(2, "Crystal Tears"),
  buffSpellIds: uniqueEquipmentIdsSchema(2, "Buff spells"),
};

const previewWeaponBuffSchema = weaponBuffSelectionSchema.nullable();

const weaponPreviewBaseShape = {
  weaponId: equipmentIdSchema,
  weaponVariantId: equipmentIdSchema,
  upgradeLevel: z.number().int().min(0).max(25),
  stats: damageStatsSchema,
  armorIds: uniqueEquipmentIdsSchema(4, "Armor selections"),
  ...previewEquipmentShape,
  weaponBuff: previewWeaponBuffSchema,
  skillBuffAshOfWarId: nullableEquipmentIdSchema,
};

export const weaponDamagePreviewRequestSchema = z.union([
  z.strictObject({ ...weaponPreviewBaseShape, attackId: equipmentIdSchema }),
  z.strictObject({ ...weaponPreviewBaseShape, skillAttackId: equipmentIdSchema }),
]);

export const spellDamagePreviewRequestSchema = z.strictObject({
  spellId: equipmentIdSchema,
  catalystWeaponId: equipmentIdSchema,
  catalystVariantId: equipmentIdSchema,
  upgradeLevel: z.number().int().min(0).max(25),
  charged: z.boolean(),
  stats: damageStatsSchema,
  ...previewEquipmentShape,
});

export const damagePreviewResponseSchema = z.looseObject({
  attackRating: z.looseObject({ total: z.number() }),
  offensiveOutput: z.looseObject({ total: z.number() }),
});

export const buildEditorDraftSchema = z.strictObject({
  ...buildEditorMetadataSchema.shape,
  ...buildCoreShape,
  weaponSlots: editorWeaponSlotsSchema,
  catalyst: catalystSelectionSchema.nullable(),
  armor: editorArmorSchema,
  greatRuneId: nullableEquipmentIdSchema,
  crystalTearIds: uniqueEquipmentIdsSchema(2, "Crystal Tears"),
  talismanIds: uniqueEquipmentIdsSchema(4, "Talismans"),
  buffSpellIds: uniqueEquipmentIdsSchema(2, "Buff spells"),
  weaponBuff: weaponBuffSelectionSchema.nullable(),
});

export function parseBuildEditorMetadata(value: unknown): BuildEditorMetadata {
  return buildEditorMetadataSchema.parse(value);
}

export function parseBuildEditorDraft(value: unknown): BuildEditorDraft {
  return buildEditorDraftSchema.parse(value);
}

export function parseBuildWriteInput(value: unknown): BuildWriteInput {
  return buildWriteInputSchema.parse(value);
}

export function getZodErrorMessage(error: unknown, fallback: string): string {
  return error instanceof z.ZodError
    ? error.issues[0]?.message ?? fallback
    : fallback;
}
