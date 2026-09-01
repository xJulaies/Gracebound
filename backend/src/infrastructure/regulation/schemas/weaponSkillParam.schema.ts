import { z } from "zod";
import { ASH_OF_WAR_COMPATIBILITY_FIELDS } from "../data/ashOfWarCompatibility";

const numberFromCsv = z.coerce.number().finite();
const integerFromCsv = z.coerce.number().int();

export const bulletParamRowSchema = z.object({
  ID: integerFromCsv.nonnegative(),
  Name: z.string(),
  atkId_Bullet: integerFromCsv,
  HitBulletID: integerFromCsv.optional(),
  intervalCreateBulletId: integerFromCsv,
  spEffectId0: integerFromCsv.optional(),
  spEffectId1: integerFromCsv.optional(),
  spEffectId2: integerFromCsv.optional(),
  spEffectId3: integerFromCsv.optional(),
  spEffectId4: integerFromCsv.optional(),
});

export const swordArtsParamRowSchema = z.object({
  ID: integerFromCsv.nonnegative(),
  Name: z.string(),
  useMagicPoint_L1: integerFromCsv,
  useMagicPoint_L2: integerFromCsv,
  useMagicPoint_R1: integerFromCsv,
  useMagicPoint_R2: integerFromCsv,
});

const equipParamGemShape: Record<string, z.ZodType> = {
  ID: integerFromCsv.nonnegative(),
  Name: z.string(),
  iconId: integerFromCsv.nonnegative(),
  swordArtsParamId: integerFromCsv,
  spEffectId0: integerFromCsv,
  spEffectId1: integerFromCsv,
  spEffectId2: integerFromCsv,
  spEffectId_forAtk0: integerFromCsv,
  spEffectId_forAtk1: integerFromCsv,
  spEffectId_forAtk2: integerFromCsv,
};

for (const field of Object.keys(ASH_OF_WAR_COMPATIBILITY_FIELDS)) {
  equipParamGemShape[field] = z.coerce.number().int().min(0).max(1);
}

for (let affinity = 0; affinity <= 12; affinity += 1) {
  equipParamGemShape[`configurableWepAttr${affinity.toString().padStart(2, "0")}`] =
    z.coerce.number().int().min(0).max(1);
}

export interface EquipParamGemRow {
  ID: number;
  Name: string;
  iconId: number;
  swordArtsParamId: number;
  [key: string]: number | string;
}

export const equipParamGemRowSchema = z.object(
  equipParamGemShape,
) as unknown as z.ZodType<EquipParamGemRow>;

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
export type FinalDamageRateRow = z.infer<typeof finalDamageRateRowSchema>;
