import { z } from "zod";

export const classSelectionRowSchema = z.object({
  ID: z.coerce.number().int(),
  Name: z.string(),
  originChrInitParam: z.coerce.number().int(),
});

export const characterInitialStatsRowSchema = z.object({
  ID: z.coerce.number().int(),
  soulLv: z.coerce.number().int().nonnegative(),
  baseVit: z.coerce.number().int().nonnegative().max(99),
  baseWil: z.coerce.number().int().nonnegative().max(99),
  baseEnd: z.coerce.number().int().nonnegative().max(99),
  baseStr: z.coerce.number().int().nonnegative().max(99),
  baseDex: z.coerce.number().int().nonnegative().max(99),
  baseMag: z.coerce.number().int().nonnegative().max(99),
  baseFai: z.coerce.number().int().nonnegative().max(99),
  baseLuc: z.coerce.number().int().nonnegative().max(99),
});

export type ClassSelectionRow = z.infer<typeof classSelectionRowSchema>;
export type CharacterInitialStatsRow = z.infer<typeof characterInitialStatsRowSchema>;
