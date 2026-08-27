import { z } from "zod";

const integerFromCsvSchema = z.coerce.number().int();

export const npcParamRowSchema = z.object({
  ID: integerFromCsvSchema.nonnegative(),
  Name: z.string(),
  hp: integerFromCsvSchema.nonnegative(),
  def_phys: integerFromCsvSchema.nonnegative(),
  def_slash: integerFromCsvSchema,
  def_blow: integerFromCsvSchema,
  def_thrust: integerFromCsvSchema,
  def_mag: integerFromCsvSchema.nonnegative(),
  def_fire: integerFromCsvSchema.nonnegative(),
  def_thunder: integerFromCsvSchema.nonnegative(),
  def_dark: integerFromCsvSchema.nonnegative(),
  neutralDamageCutRate: z.coerce.number().finite(),
  slashDamageCutRate: z.coerce.number().finite(),
  blowDamageCutRate: z.coerce.number().finite(),
  thrustDamageCutRate: z.coerce.number().finite(),
  magicDamageCutRate: z.coerce.number().finite(),
  fireDamageCutRate: z.coerce.number().finite(),
  thunderDamageCutRate: z.coerce.number().finite(),
  darkDamageCutRate: z.coerce.number().finite(),
  spEffectID0: integerFromCsvSchema,
  spEffectID1: integerFromCsvSchema,
  spEffectID2: integerFromCsvSchema,
  spEffectID3: integerFromCsvSchema,
  spEffectID4: integerFromCsvSchema,
  spEffectID5: integerFromCsvSchema,
  spEffectID6: integerFromCsvSchema,
  spEffectID7: integerFromCsvSchema,
});

export type NpcParamRow = z.infer<typeof npcParamRowSchema>;
