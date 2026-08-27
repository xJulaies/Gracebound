import { z } from "zod";

const numberFromCsv = z.coerce.number().finite();
const integerFromCsv = z.coerce.number().int();

export const bulletParamRowSchema = z.object({
  ID: integerFromCsv.nonnegative(),
  Name: z.string(),
  atkId_Bullet: integerFromCsv,
  intervalCreateBulletId: integerFromCsv,
});

export const swordArtsParamRowSchema = z.object({
  ID: integerFromCsv.nonnegative(),
  Name: z.string(),
  useMagicPoint_R1: integerFromCsv,
  useMagicPoint_R2: integerFromCsv,
});

export const equipParamGemRowSchema = z.object({
  ID: integerFromCsv.nonnegative(),
  Name: z.string(),
  swordArtsParamId: integerFromCsv,
  spEffectId0: integerFromCsv,
  spEffectId1: integerFromCsv,
  spEffectId2: integerFromCsv,
  spEffectId_forAtk0: integerFromCsv,
  spEffectId_forAtk1: integerFromCsv,
  spEffectId_forAtk2: integerFromCsv,
});

export const finalDamageRateRowSchema = z.object({
  ID: integerFromCsv.nonnegative(),
  Name: z.string(),
  physRate: numberFromCsv.nonnegative(),
  magRate: numberFromCsv.nonnegative(),
  fireRate: numberFromCsv.nonnegative(),
  thunRate: numberFromCsv.nonnegative(),
  darkRate: numberFromCsv.nonnegative(),
});

export type BulletParamRow = z.infer<typeof bulletParamRowSchema>;
export type SwordArtsParamRow = z.infer<typeof swordArtsParamRowSchema>;
export type EquipParamGemRow = z.infer<typeof equipParamGemRowSchema>;
export type FinalDamageRateRow = z.infer<typeof finalDamageRateRowSchema>;
