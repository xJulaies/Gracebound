import { z } from "zod";

const numberFromCsv = z.coerce.number().finite();
const integerFromCsv = z.coerce.number().int();

export const behaviorParamRowSchema = z.object({
  ID: integerFromCsv.nonnegative(),
  Name: z.string(),
  variationId: integerFromCsv.nonnegative(),
  behaviorJudgeId: integerFromCsv.nonnegative(),
  refType: integerFromCsv.nonnegative(),
  refId: integerFromCsv,
});

export const attackParamRowSchema = z.object({
  ID: integerFromCsv.nonnegative(),
  Name: z.string(),
  atkPhysCorrection: numberFromCsv.nonnegative(),
  atkMagCorrection: numberFromCsv.nonnegative(),
  atkFireCorrection: numberFromCsv.nonnegative(),
  atkThunCorrection: numberFromCsv.nonnegative(),
  atkDarkCorrection: numberFromCsv.nonnegative(),
  atkPhys: numberFromCsv.nonnegative(),
  atkMag: numberFromCsv.nonnegative(),
  atkFire: numberFromCsv.nonnegative(),
  atkThun: numberFromCsv.nonnegative(),
  atkDark: numberFromCsv.nonnegative(),
  atkAttribute: integerFromCsv.nonnegative(),
  isAddBaseAtk: z.coerce.number().int().min(0).max(1),
  finalDamageRateId: integerFromCsv,
});

export type BehaviorParamRow = z.infer<typeof behaviorParamRowSchema>;
export type AttackParamRow = z.infer<typeof attackParamRowSchema>;
