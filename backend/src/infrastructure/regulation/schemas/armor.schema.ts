import { z } from "zod";

const finite = z.coerce.number().finite();

export const armorParamRowSchema = z.object({
  ID: z.coerce.number().int().nonnegative(),
  Name: z.string(),
  protectorCategory: z.coerce.number().int(),
  iconIdM: z.coerce.number().int().nonnegative(),
  weight: finite.nonnegative(),
  toughnessCorrectRate: finite.nonnegative(),
  neutralDamageCutRate: finite.nonnegative(),
  slashDamageCutRate: finite.nonnegative(),
  blowDamageCutRate: finite.nonnegative(),
  thrustDamageCutRate: finite.nonnegative(),
  magicDamageCutRate: finite.nonnegative(),
  fireDamageCutRate: finite.nonnegative(),
  thunderDamageCutRate: finite.nonnegative(),
  darkDamageCutRate: finite.nonnegative(),
  resistPoison: z.coerce.number().int().nonnegative(),
  resistDisease: z.coerce.number().int().nonnegative(),
  resistBlood: z.coerce.number().int().nonnegative(),
  resistFreeze: z.coerce.number().int().nonnegative(),
  resistSleep: z.coerce.number().int().nonnegative(),
  resistMadness: z.coerce.number().int().nonnegative(),
  resistCurse: z.coerce.number().int().nonnegative(),
  residentSpEffectId: z.coerce.number().int(),
  residentSpEffectId2: z.coerce.number().int(),
  residentSpEffectId3: z.coerce.number().int(),
});

export type ArmorParamRow = z.infer<typeof armorParamRowSchema>;
