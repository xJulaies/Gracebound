import { z } from "zod";
import {
  damageTypesSchema,
  identifierSchema,
  versionSchema,
} from "../../../shared/schemas/game.schemas";

const weaponSlotIdSchema = z.enum([
  "rightHand1", "rightHand2", "rightHand3", "leftHand1", "leftHand2", "leftHand3",
]);

const effectsSchema = z.strictObject({
  greatRuneActive: z.boolean(),
  wondrousPhysickActive: z.boolean(),
  activeBuffSpellIds: z.array(identifierSchema).max(2)
    .refine((ids) => new Set(ids).size === ids.length, "Buff spells must be unique."),
  weaponBuffActive: z.boolean(),
});

const targetSchema = z.strictObject({
  bossId: identifierSchema,
  bossPhaseId: identifierSchema.optional(),
});

export const savedBuildDamageRequestSchema = z.union([
  effectsSchema.extend({
    ...targetSchema.shape,
    weaponSlotId: weaponSlotIdSchema,
    attackId: identifierSchema,
    skillBuffActive: z.boolean(),
  }),
  effectsSchema.extend({
    ...targetSchema.shape,
    weaponSlotId: weaponSlotIdSchema,
    skillAttackId: identifierSchema,
    skillBuffActive: z.boolean(),
  }),
  effectsSchema.extend({
    ...targetSchema.shape,
    spellId: identifierSchema,
    charged: z.boolean(),
  }),
]);

const damageBreakdownSchema = damageTypesSchema.extend({ total: z.number() });

const resultBaseShape = {
  attack: z.strictObject({
    id: identifierSchema,
    name: z.string().min(1),
    fpCost: z.number().nonnegative(),
  }),
  attackRating: damageBreakdownSchema,
  offensiveOutput: damageBreakdownSchema,
  damage: damageBreakdownSchema,
  totalDamage: z.number().nonnegative(),
  specialDamage: z.array(z.strictObject({
    id: identifierSchema,
    name: z.string().min(1),
    maximumHealthRate: z.number(),
    flatDamage: z.number(),
    durationSeconds: z.number().nonnegative(),
    applicationCount: z.number().int().nonnegative(),
    damagePerApplication: z.number().nonnegative(),
    totalDamage: z.number().nonnegative(),
  })),
  components: z.array(z.looseObject({
    kind: z.string().min(1),
    sourceAttackId: z.number().int(),
    id: identifierSchema.optional(),
    label: z.string().min(1).optional(),
    outputUnit: z.enum(["per-hit", "per-tick"]).optional(),
    offensiveOutput: damageBreakdownSchema,
    damage: damageBreakdownSchema,
  })),
  target: z.strictObject({ id: identifierSchema, name: z.string().min(1) }),
  accuracy: z.literal("estimated"),
  outputUnit: z.enum(["per-hit", "per-tick", "per-component"]).optional(),
  limitations: z.array(z.string()),
  buffs: z.array(z.strictObject({
    id: identifierSchema,
    name: z.string().min(1),
    slot: z.enum(["aura", "body", "weapon"]),
    durationSeconds: z.number().nonnegative(),
  })),
  greatRune: z.strictObject({ id: identifierSchema, name: z.string().min(1) }).nullable(),
  crystalTears: z.array(z.strictObject({ id: identifierSchema, name: z.string().min(1) })),
  talismans: z.array(z.strictObject({ id: identifierSchema, name: z.string().min(1) })),
};

// Damage calculations also expose diagnostic state (effective attributes,
// applied weapon/skill buffs, status buildup, and recovery metadata). The trial
// consumes the fields below, so validate those while preserving additive API
// fields for forward-compatible diagnostics.
const weaponDamageTrialResultSchema = z.looseObject({
  ...resultBaseShape,
  weapon: z.strictObject({
    id: identifierSchema,
    name: z.string().min(1),
    gameVersion: versionSchema,
    upgradeLevel: z.number().int().min(0).max(25),
    affinity: z.string().min(1),
  }),
});

const spellDamageTrialResultSchema = z.looseObject({
  ...resultBaseShape,
  spell: z.strictObject({
    id: identifierSchema,
    name: z.string().min(1),
    type: z.enum(["sorcery", "incantation"]),
    charged: z.boolean(),
  }),
  catalyst: z.strictObject({
    weaponId: identifierSchema,
    variantId: identifierSchema,
    name: z.string().min(1),
    upgradeLevel: z.number().int().min(0).max(25),
  }),
  aggregateAssumption: z.literal("one-occurrence-per-component").nullable(),
});

export const damageTrialResultSchema = z.union([
  weaponDamageTrialResultSchema,
  spellDamageTrialResultSchema,
]);
