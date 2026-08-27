import { z } from "zod";

const numberFromCsv = z.coerce.number().finite();
const integerFromCsv = z.coerce.number().int();

export const weaponParamRowSchema = z.object({
  ID: integerFromCsv.nonnegative(),
  Name: z.string(),
  weaponCategory: integerFromCsv.nonnegative(),
  wepType: integerFromCsv.nonnegative(),
  originEquipWep: integerFromCsv,
  weight: numberFromCsv.nonnegative(),
  iconId: integerFromCsv.nonnegative(),
  swordArtsParamId: integerFromCsv,
  attackBasePhysics: numberFromCsv.nonnegative(),
  attackBaseMagic: numberFromCsv.nonnegative(),
  attackBaseFire: numberFromCsv.nonnegative(),
  attackBaseThunder: numberFromCsv.nonnegative(),
  attackBaseDark: numberFromCsv.nonnegative(),
  correctStrength: numberFromCsv,
  correctAgility: numberFromCsv,
  correctMagic: numberFromCsv,
  correctFaith: numberFromCsv,
  correctLuck: numberFromCsv,
  properStrength: integerFromCsv.nonnegative(),
  properAgility: integerFromCsv.nonnegative(),
  properMagic: integerFromCsv.nonnegative(),
  properFaith: integerFromCsv.nonnegative(),
  properLuck: integerFromCsv.nonnegative(),
  reinforceTypeId: integerFromCsv.nonnegative(),
  attackElementCorrectId: integerFromCsv.nonnegative(),
  correctType_Physics: integerFromCsv.nonnegative(),
  correctType_Magic: integerFromCsv.nonnegative(),
  correctType_Fire: integerFromCsv.nonnegative(),
  correctType_Thunder: integerFromCsv.nonnegative(),
  correctType_Dark: integerFromCsv.nonnegative(),
  atkAttribute: integerFromCsv.nonnegative(),
  atkAttribute2: integerFromCsv.nonnegative(),
});

export const reinforceWeaponRowSchema = z.object({
  ID: integerFromCsv.nonnegative(),
  Name: z.string(),
  physicsAtkRate: numberFromCsv.nonnegative(),
  magicAtkRate: numberFromCsv.nonnegative(),
  fireAtkRate: numberFromCsv.nonnegative(),
  thunderAtkRate: numberFromCsv.nonnegative(),
  darkAtkRate: numberFromCsv.nonnegative(),
  correctStrengthRate: numberFromCsv.nonnegative(),
  correctAgilityRate: numberFromCsv.nonnegative(),
  correctMagicRate: numberFromCsv.nonnegative(),
  correctFaithRate: numberFromCsv.nonnegative(),
  correctLuckRate: numberFromCsv.nonnegative(),
});

const correctionShape: Record<string, z.ZodType> = {
  ID: integerFromCsv.nonnegative(),
  Name: z.string(),
};

const sourceAttributes = ["Strength", "Dexterity", "Magic", "Faith", "Luck"];
const sourceDamageTypes = ["Physics", "Magic", "Fire", "Thunder", "Dark"];

for (const damageType of sourceDamageTypes) {
  for (const attribute of sourceAttributes) {
    correctionShape[`is${attribute}Correct_by${damageType}`] = z.coerce
      .number()
      .int()
      .min(0)
      .max(1);
    correctionShape[`overwrite${attribute}CorrectRate_by${damageType}`] =
      numberFromCsv;
    correctionShape[`Influence${attribute}CorrectRate_by${damageType}`] =
      numberFromCsv;
  }
}

export interface AttackElementCorrectRow {
  ID: number;
  Name: string;
  [key: string]: number | string;
}

export const attackElementCorrectRowSchema = z.object(
  correctionShape,
) as unknown as z.ZodType<AttackElementCorrectRow>;

const graphShape: Record<string, z.ZodType> = {
  ID: integerFromCsv.nonnegative(),
  Name: z.string(),
};

for (let stage = 0; stage < 5; stage += 1) {
  graphShape[`stageMaxVal${stage}`] = numberFromCsv.nonnegative();
  graphShape[`stageMaxGrowVal${stage}`] = numberFromCsv;
  graphShape[`adjPt_maxGrowVal${stage}`] = numberFromCsv;
}

export interface CalcCorrectGraphRow {
  ID: number;
  Name: string;
  [key: string]: number | string;
}

export const calcCorrectGraphRowSchema = z.object(
  graphShape,
) as unknown as z.ZodType<CalcCorrectGraphRow>;

export type WeaponParamRow = z.infer<typeof weaponParamRowSchema>;
export type ReinforceWeaponRow = z.infer<typeof reinforceWeaponRowSchema>;
