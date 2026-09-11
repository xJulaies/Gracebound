import { z } from "zod";
import {
  assetUrlSchema,
  calculationStatusSchema,
  catalogTextSchema,
  characterStatsSchema,
  damageTypesSchema,
  identifierSchema,
  statusResistancesSchema,
  versionSchema,
} from "../../../shared/schemas/game.schemas";

export const crystalTearSchema = z.strictObject({
  id: identifierSchema,
  name: z.string().min(1),
  summary: catalogTextSchema,
  description: catalogTextSchema,
  iconId: z.number().int().nonnegative(),
  iconUrl: assetUrlSchema,
  calculationStatus: calculationStatusSchema,
  effects: z.strictObject({
    durationSeconds: z.number().nonnegative(),
    attributeBonuses: characterStatsSchema,
    resourceMultipliers: z.strictObject({
      maxHp: z.number(),
      maxStamina: z.number(),
      maxEquipLoad: z.number(),
    }),
    outgoingDamageMultipliers: damageTypesSchema,
    chargedAttackDamageMultipliers: damageTypesSchema,
    incomingDamageMultipliers: damageTypesSchema,
    fpCostMultipliers: z.strictObject({
      skill: z.number(),
      sorcery: z.number(),
      incantation: z.number(),
    }),
    poiseDamageMultiplier: z.number(),
    staminaRecoverySpeedBonus: z.number(),
    statusResistanceBonuses: statusResistancesSchema,
    cleansesStatusBuildup: z.array(z.enum([
      "poison", "rot", "bleed", "frost", "sleep", "madness", "deathBlight",
    ])),
    recovery: z.strictObject({
      instantMaxHpPercent: z.number(),
      instantMaxFpPercent: z.number(),
      hpPerSecond: z.number(),
      hpRegenerationDurationSeconds: z.number(),
    }),
  }).nullable(),
  limitations: z.array(z.string()),
  gameVersion: versionSchema,
});
