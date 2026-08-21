import { z } from "zod";

const damageTypesSchema = z.object({
  physical: z.number().finite().nonnegative().optional(),
  magic: z.number().finite().nonnegative().optional(),
  fire: z.number().finite().nonnegative().optional(),
  lightning: z.number().finite().nonnegative().optional(),
  holy: z.number().finite().nonnegative().optional(),
});

const attributesSchema = z.object({
  strength: z.number().finite().nonnegative().optional(),
  dexterity: z.number().finite().nonnegative().optional(),
  intelligence: z.number().finite().nonnegative().optional(),
  faith: z.number().finite().nonnegative().optional(),
  arcane: z.number().finite().nonnegative().optional(),
});

const reinforcementDamageSchema = z.object({
  physical: z.number().finite().nonnegative(),
  magic: z.number().finite().nonnegative(),
  fire: z.number().finite().nonnegative(),
  lightning: z.number().finite().nonnegative(),
  holy: z.number().finite().nonnegative(),
});

const reinforcementScalingSchema = z.object({
  strength: z.number().finite().nonnegative(),
  dexterity: z.number().finite().nonnegative(),
  intelligence: z.number().finite().nonnegative(),
  faith: z.number().finite().nonnegative(),
  arcane: z.number().finite().nonnegative(),
});

const correctionCalcIdSchema = z.object({
  physical: z.number().int().nonnegative(),
  magic: z.number().int().nonnegative(),
  fire: z.number().int().nonnegative(),
  lightning: z.number().int().nonnegative(),
  holy: z.number().int().nonnegative(),
});

const affinitySchema = z.object({
  reinforcement_id: z.number().int().nonnegative(),
  correction_attack_id: z.number().int().nonnegative(),
  correction_calc_id: correctionCalcIdSchema,
  damage: damageTypesSchema,
  scaling: attributesSchema,
});

export const erdbArmamentSchema = z.object({
  id: z.number().int().positive(),
  name: z.string().trim().min(1),
  requirements: attributesSchema,
  affinity: z.record(z.string(), affinitySchema),
});

export const erdbArmamentsSchema = z.record(
  z.string().min(1),
  erdbArmamentSchema,
);

const reinforcementLevelSchema = z.object({
  level: z.number().int().min(0).max(25),
  damage: reinforcementDamageSchema,
  scaling: reinforcementScalingSchema,
});

export const erdbReinforcementsSchema = z.record(
  z.string().regex(/^\d+$/),
  z.array(reinforcementLevelSchema).min(1).max(26),
);

const attributeCorrectionsSchema = z.object({
  strength: z.boolean(),
  dexterity: z.boolean(),
  intelligence: z.boolean(),
  faith: z.boolean(),
  arcane: z.boolean(),
});

const optionalAttributeValuesSchema = z.object({
  strength: z.number().finite().optional(),
  dexterity: z.number().finite().optional(),
  intelligence: z.number().finite().optional(),
  faith: z.number().finite().optional(),
  arcane: z.number().finite().optional(),
});

const requiredAttributeValuesSchema = z.object({
  strength: z.number().finite(),
  dexterity: z.number().finite(),
  intelligence: z.number().finite(),
  faith: z.number().finite(),
  arcane: z.number().finite(),
});

const damageTypeCorrectionsSchema = z.object({
  physical: attributeCorrectionsSchema,
  magic: attributeCorrectionsSchema,
  fire: attributeCorrectionsSchema,
  lightning: attributeCorrectionsSchema,
  holy: attributeCorrectionsSchema,
});

const optionalDamageTypeValuesSchema = z.object({
  physical: optionalAttributeValuesSchema,
  magic: optionalAttributeValuesSchema,
  fire: optionalAttributeValuesSchema,
  lightning: optionalAttributeValuesSchema,
  holy: optionalAttributeValuesSchema,
});

const requiredDamageTypeValuesSchema = z.object({
  physical: requiredAttributeValuesSchema,
  magic: requiredAttributeValuesSchema,
  fire: requiredAttributeValuesSchema,
  lightning: requiredAttributeValuesSchema,
  holy: requiredAttributeValuesSchema,
});

const correctionAttackSchema = z.object({
  correction: damageTypeCorrectionsSchema,
  override: optionalDamageTypeValuesSchema,
  ratio: requiredDamageTypeValuesSchema,
});

export const erdbCorrectionAttacksSchema = z.record(
  z.string().regex(/^\d+$/),
  correctionAttackSchema,
);

export const erdbCorrectionGraphsSchema = z.record(
  z.string().regex(/^\d+$/),
  z.array(z.number().finite().nonnegative()).length(151),
);

export const erdbWeaponImportSchema = z.object({
  gameVersion: z.string().regex(/^\d+\.\d+\.\d+$/),
  armaments: erdbArmamentsSchema,
  reinforcements: erdbReinforcementsSchema,
  correctionAttacks: erdbCorrectionAttacksSchema,
  correctionGraphs: erdbCorrectionGraphsSchema,
});

export type ErdbArmament = z.infer<typeof erdbArmamentSchema>;
export type ErdbWeaponImport = z.infer<typeof erdbWeaponImportSchema>;
export type ErdbReinforcements = z.infer<typeof erdbReinforcementsSchema>;
export type ErdbCorrectionAttacks = z.infer<
  typeof erdbCorrectionAttacksSchema
>;
export type ErdbCorrectionGraphs = z.infer<typeof erdbCorrectionGraphsSchema>;
