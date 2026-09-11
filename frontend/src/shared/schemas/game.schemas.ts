import { z } from "zod";

export const identifierSchema = z.string().trim().min(1).max(100);
export const catalogTextSchema = z.string().nullable();
export const calculationStatusSchema = z.enum(["supported", "catalog-only"]);

export const characterStatsSchema = z.strictObject({
  vigor: z.number().int(),
  mind: z.number().int(),
  endurance: z.number().int(),
  strength: z.number().int(),
  dexterity: z.number().int(),
  intelligence: z.number().int(),
  faith: z.number().int(),
  arcane: z.number().int(),
});

export const damageTypesSchema = z.strictObject({
  physical: z.number(),
  magic: z.number(),
  fire: z.number(),
  lightning: z.number(),
  holy: z.number(),
});

export const statusResistancesSchema = z.strictObject({
  poison: z.number(),
  rot: z.number(),
  bleed: z.number(),
  frost: z.number(),
  sleep: z.number(),
  madness: z.number(),
  deathBlight: z.number(),
});

export const versionSchema = z.string().trim().min(1).max(30);
export const assetUrlSchema = z.string().min(1);
export const numericRecordSchema = z.record(z.string(), z.number());
