import type { RequestHandler } from "express";
import request from "supertest";
import { beforeEach, describe, expect, it } from "vitest";
import { createApp } from "../../app";
import type { BossData } from "../bosses/domain/boss.types";
import { saveBossDataSet } from "../../infrastructure/regulation/services/saveBossDataSet";
import { saveWeaponCatalog } from "../../infrastructure/regulation/services/saveWeaponCatalog";
import { saveAshOfWarCatalog } from "../../infrastructure/regulation/services/saveAshOfWarCatalog";
import type { AshOfWarData } from "../ashesOfWar/domain/ashOfWar.types";
import type { TalismanData } from "../talismans/domain/talisman.types";
import { saveTalismanCatalog } from "../../infrastructure/regulation/services/saveTalismanCatalog";
import {
  createRegulationWeaponCatalogFixture,
  REGULATION_TEST_GAME_VERSION,
  REGULATION_TEST_SOURCE_HASH,
} from "../../test/fixtures/regulationWeaponCatalog.fixture";
import { useMongoMemoryServer } from "../../test/useMongoMemoryServer";
import { ReinforcementModel } from "../weapons/models/reinforcement.model";
import { ScalingCurveModel } from "../weapons/models/scalingCurve.model";
import { WeaponVariantModel } from "../weapons/models/weapon.model";
import { WeaponCatalogModel } from "../weapons/models/weaponCatalog.model";
import { BossModel } from "../bosses/models/boss.model";
import { saveArmorCatalog } from "../../infrastructure/regulation/services/saveArmorCatalog";
import { saveSpellCatalog } from "../../infrastructure/regulation/services/saveSpellCatalog";
import type { SpellData, SpellBuffEffect } from "../spells/domain/spell.types";
import { neutralArmorPassiveEffects, type ArmorData } from "../armor/domain/armor.types";
import { GreatRuneModel } from "../greatRunes/models/greatRune.model";
import { createGreatRuneRecordFixture } from "../../test/fixtures/greatRune.fixture";
import { CrystalTearModel } from "../crystalTears/models/crystalTear.model";
import { createCrystalTearRecordFixture } from "../../test/fixtures/crystalTear.fixture";

const passThroughAuthentication: RequestHandler = (_req, _res, next) => {
  next();
};

const app = createApp({
  authenticationMiddleware: passThroughAuthentication,
  getAuthenticatedUserId: () => null,
});
const authenticatedApp = createApp({
  authenticationMiddleware: passThroughAuthentication,
  getAuthenticatedUserId: (request) => request.header("x-test-user-id") ?? null,
});

useMongoMemoryServer({ replicaSet: true });

beforeEach(async () => {
  await Promise.all([
    saveWeaponCatalog(createRegulationWeaponCatalogFixture(), {
      gameVersion: REGULATION_TEST_GAME_VERSION,
      sourceHash: REGULATION_TEST_SOURCE_HASH,
    }),
    saveBossDataSet([boss], {
      gameVersion: REGULATION_TEST_GAME_VERSION,
      sourceHash: REGULATION_TEST_SOURCE_HASH,
    }),
    saveAshOfWarCatalog([squareOff, wildStrikes, cragblade], {
      gameVersion: REGULATION_TEST_GAME_VERSION,
      sourceHash: REGULATION_TEST_SOURCE_HASH,
    }),
    saveTalismanCatalog([starscourgeHeirloom, magicScorpionCharm, shardOfAlexander, axeTalisman], {
      gameVersion: REGULATION_TEST_GAME_VERSION,
      sourceHash: REGULATION_TEST_SOURCE_HASH,
    }),
    saveArmorCatalog([silverTearMask], {
      gameVersion: REGULATION_TEST_GAME_VERSION,
      sourceHash: REGULATION_TEST_SOURCE_HASH,
    }),
    saveSpellCatalog([
      buffSpell("golden-vow", "Golden Vow", "incantation", auraBuff),
      buffSpell("flame-grant-me-strength", "Flame Grant Me Strength", "incantation", bodyBuff),
      buffSpell("test-body-buff", "Test Body Buff", "incantation", bodyBuff),
      buffSpell("scholar-s-armament", "Scholar's Armament", "sorcery", weaponBuff),
      buffSpell("frozen-armament", "Frozen Armament", "sorcery", frozenArmament),
    ], {
      gameVersion: REGULATION_TEST_GAME_VERSION,
      sourceHash: REGULATION_TEST_SOURCE_HASH,
    }),
    GreatRuneModel.create([
      createGreatRuneRecordFixture("godricks-great-rune"),
      createGreatRuneRecordFixture("rykards-great-rune"),
    ]),
    CrystalTearModel.create([
      createCrystalTearRecordFixture("strength-knot-crystal-tear"),
      createCrystalTearRecordFixture("magic-shrouding-cracked-tear"),
      createCrystalTearRecordFixture("thorny-cracked-tear"),
      createCrystalTearRecordFixture("spiked-cracked-tear"),
      createCrystalTearRecordFixture("stonebarb-cracked-tear"),
    ]),
  ]);
});

const silverTearEffects = neutralArmorPassiveEffects();
silverTearEffects.scopedDamageBoosts.push({
  scope: "all-physical-attacks",
  damageMultipliers: { physical: 0.95, magic: 1, fire: 1, lightning: 1, holy: 1 },
});
const silverTearMask: ArmorData = {
  id: "silver-tear-mask", sourceProtectorId: 610900, name: "Silver Tear Mask", slot: "head",
  iconId: 1, weight: 4.6, poise: 5,
  damageNegation: { physical: 0, strike: 0, slash: 0, pierce: 0, magic: 0, fire: 0, lightning: 0, holy: 0 },
  resistances: { poison: 0, rot: 0, bleed: 0, frost: 0, sleep: 0, madness: 0, deathBlight: 0 },
  sourceEffectIds: [6109000], hasUnresolvedPassiveEffects: false, passiveEffects: silverTearEffects,
};

const auraBuff = createBuffEffect("aura", 80, { physical: 1.15, magic: 1.15, fire: 1.15, lightning: 1.15, holy: 1.15 });
const bodyBuff = createBuffEffect("body", 30, { physical: 1.2, magic: 1, fire: 1.2, lightning: 1, holy: 1 });
const weaponBuff = createBuffEffect("weapon", 90, damageTypes(1), { physical: 0, magic: 0.75, fire: 0, lightning: 0, holy: 0 });
const frozenArmament = createBuffEffect(
  "weapon", 60, damageTypes(1), damageTypes(0),
  { poison: 0, rot: 0, bleed: 0, frost: 63, sleep: 0, madness: 0, deathBlight: 0 },
);

const boss: BossData = {
  id: "test-boss",
  name: "Test Boss",
  health: 1000,
  defense: { physical: 100, magic: 100, fire: 100, lightning: 100, holy: 100 },
  absorption: {
    physical: { standard: 20, slash: 20, strike: 20, pierce: 20 },
    magic: 40,
    fire: 0,
    lightning: 0,
    holy: 0,
  },
  sourceNpcId: 1,
  healthScalingEffectId: 1,
};

const squareOff: AshOfWarData = {
  id: "square-off",
  sourceGemId: 11500,
  name: "Square Off",
  iconId: 0,
  sourceSwordArtId: 115,
  compatibleWeaponTypes: ["straight-sword"],
  compatibleAffinities: ["standard"],
  calculationStatus: "supported",
  buffEffect: null,
  skill: {
    id: "square-off",
    name: "Square Off",
    sourceSwordArtId: 115,
    attacks: [
      {
        id: "square-off-light",
        name: "Square Off (Light)",
        fpCost: 6,
        components: [
          {
            kind: "weapon-hit",
            sourceBehaviorId: 300000700,
            sourceAttackId: 300000700,
            physicalAttackType: "standard",
            motionValues: damageTypes(200),
            addedDamage: damageTypes(0),
            finalDamageRates: damageTypes(1),
          },
        ],
      },
    ],
  },
  skillVariants: [],
};

const wildStrikes: AshOfWarData = {
  id: "wild-strikes",
  sourceGemId: 11000,
  name: "Wild Strikes",
  iconId: 0,
  sourceSwordArtId: 110,
  compatibleWeaponTypes: ["straight-sword"],
  compatibleAffinities: ["standard"],
  calculationStatus: "supported",
  buffEffect: null,
  skill: null,
  skillVariants: [
    {
      weaponTypes: ["straight-sword"],
      skill: {
        id: "wild-strikes",
        name: "Wild Strikes",
        sourceSwordArtId: 110,
        attacks: [
          {
            id: "wild-strikes-loop-1",
            name: "Wild Strikes (Loop 1)",
            fpCost: 2,
            components: [
              {
                kind: "weapon-hit",
                sourceBehaviorId: 300000500,
                sourceAttackId: 301401800,
                physicalAttackType: "slash",
                motionValues: damageTypes(107),
                addedDamage: damageTypes(0),
                finalDamageRates: damageTypes(1),
              },
            ],
          },
        ],
      },
    },
  ],
};

const cragblade: AshOfWarData = {
  id: "cragblade", sourceGemId: 60700, name: "Cragblade", iconId: 60700,
  sourceSwordArtId: 607, compatibleWeaponTypes: ["straight-sword"],
  compatibleAffinities: ["standard"], calculationStatus: "supported",
  skill: null, skillVariants: [],
  buffEffect: {
    durationSeconds: 60, consumption: "duration",
    attackPowerMultipliers: { physical: 1.15, magic: 1, fire: 1, lightning: 1, holy: 1 },
    outgoingDamageMultipliers: damageTypes(1), addedDamage: damageTypes(0),
    addedStatusBuildup: { poison: 0, rot: 0, bleed: 0, frost: 0, sleep: 0, madness: 0, deathBlight: 0 },
    poiseDamageMultiplier: 1.1, limitations: [],
  },
};

const starscourgeHeirloom: TalismanData = {
  id: "starscourge-heirloom",
  sourceAccessoryId: 1060,
  name: "Starscourge Heirloom",
  iconId: 18100,
  weight: 0.8,
  sourceEffectId: 310600,
  calculationStatus: "supported",
  effects: {
    resourceMultipliers: { maxHp: 1, maxFp: 1, maxStamina: 1, maxEquipLoad: 1 },
    statusResistanceBonuses: statusResistanceBonuses(),
    spellDamageMultipliers: { sorcery: 1, incantation: 1 },
    utilityEffects: utilityEffects(),
    recoveryEffects: recoveryEffects(),
    guardEffects: { staminaDamageMultiplier: 1, staminaCostMultiplier: 1 },
    conditionalAttackDamageMultipliers: conditionalAttackDamageMultipliers(),
    hpConditionedDamageEffect: neutralHpConditionedDamageEffect(),
    specializedAttackEffects: neutralSpecializedAttackEffects(),
    successiveAttackEffect: { stages: [] },
    triggeredDamageEffect: neutralTriggeredDamageEffect(),
    eventRecoveryEffect: neutralEventRecoveryEffect(),
    miscellaneousEffects: neutralMiscellaneousEffects(),
    specialDefenseEffects: neutralSpecialDefenseEffects(),
    attributeBonuses: {
      vigor: 0,
      mind: 0,
      endurance: 0,
      strength: 5,
      dexterity: 0,
      intelligence: 0,
      faith: 0,
      arcane: 0,
    },
    incomingDamageMultipliers: damageTypes(1),
    outgoingDamageMultipliers: damageTypes(1),
    skillDamageMultipliers: damageTypes(1),
    chargedAttackDamageMultipliers: damageTypes(1),
  },
};

const magicScorpionCharm: TalismanData = {
  id: "magic-scorpion-charm",
  sourceAccessoryId: 2000,
  name: "Magic Scorpion Charm",
  iconId: 18230,
  weight: 0.8,
  sourceEffectId: 320000,
  calculationStatus: "supported",
  effects: {
    resourceMultipliers: { maxHp: 1, maxFp: 1, maxStamina: 1, maxEquipLoad: 1 },
    statusResistanceBonuses: statusResistanceBonuses(),
    spellDamageMultipliers: { sorcery: 1, incantation: 1 },
    utilityEffects: utilityEffects(),
    recoveryEffects: recoveryEffects(),
    guardEffects: { staminaDamageMultiplier: 1, staminaCostMultiplier: 1 },
    conditionalAttackDamageMultipliers: conditionalAttackDamageMultipliers(),
    hpConditionedDamageEffect: neutralHpConditionedDamageEffect(),
    specializedAttackEffects: neutralSpecializedAttackEffects(),
    successiveAttackEffect: { stages: [] },
    triggeredDamageEffect: neutralTriggeredDamageEffect(),
    eventRecoveryEffect: neutralEventRecoveryEffect(),
    miscellaneousEffects: neutralMiscellaneousEffects(),
    specialDefenseEffects: neutralSpecialDefenseEffects(),
    attributeBonuses: {
      vigor: 0, mind: 0, endurance: 0, strength: 0, dexterity: 0,
      intelligence: 0, faith: 0, arcane: 0,
    },
    incomingDamageMultipliers: {
      physical: 1.1, magic: 1, fire: 1, lightning: 1, holy: 1,
    },
    outgoingDamageMultipliers: {
      physical: 1, magic: 1.12, fire: 1, lightning: 1, holy: 1,
    },
    skillDamageMultipliers: damageTypes(1),
    chargedAttackDamageMultipliers: damageTypes(1),
  },
};

const shardOfAlexander: TalismanData = {
  id: "shard-of-alexander",
  sourceAccessoryId: 1231,
  name: "Shard of Alexander",
  iconId: 18871,
  weight: 0.9,
  sourceEffectId: 312310,
  calculationStatus: "supported",
  effects: {
    resourceMultipliers: { maxHp: 1, maxFp: 1, maxStamina: 1, maxEquipLoad: 1 },
    statusResistanceBonuses: statusResistanceBonuses(),
    spellDamageMultipliers: { sorcery: 1, incantation: 1 },
    utilityEffects: utilityEffects(),
    recoveryEffects: recoveryEffects(),
    guardEffects: { staminaDamageMultiplier: 1, staminaCostMultiplier: 1 },
    conditionalAttackDamageMultipliers: conditionalAttackDamageMultipliers(),
    hpConditionedDamageEffect: neutralHpConditionedDamageEffect(),
    specializedAttackEffects: neutralSpecializedAttackEffects(),
    successiveAttackEffect: { stages: [] },
    triggeredDamageEffect: neutralTriggeredDamageEffect(),
    eventRecoveryEffect: neutralEventRecoveryEffect(),
    miscellaneousEffects: neutralMiscellaneousEffects(),
    specialDefenseEffects: neutralSpecialDefenseEffects(),
    attributeBonuses: {
      vigor: 0, mind: 0, endurance: 0, strength: 0, dexterity: 0,
      intelligence: 0, faith: 0, arcane: 0,
    },
    incomingDamageMultipliers: damageTypes(1),
    outgoingDamageMultipliers: damageTypes(1),
    skillDamageMultipliers: damageTypes(1.15),
    chargedAttackDamageMultipliers: damageTypes(1),
  },
};

const axeTalisman: TalismanData = {
  id: "axe-talisman",
  sourceAccessoryId: 2130,
  name: "Axe Talisman",
  iconId: 18370,
  weight: 0.8,
  sourceEffectId: 321300,
  calculationStatus: "supported",
  effects: {
    resourceMultipliers: { maxHp: 1, maxFp: 1, maxStamina: 1, maxEquipLoad: 1 },
    statusResistanceBonuses: statusResistanceBonuses(),
    spellDamageMultipliers: { sorcery: 1, incantation: 1 },
    utilityEffects: utilityEffects(),
    recoveryEffects: recoveryEffects(),
    guardEffects: { staminaDamageMultiplier: 1, staminaCostMultiplier: 1 },
    conditionalAttackDamageMultipliers: conditionalAttackDamageMultipliers(),
    hpConditionedDamageEffect: neutralHpConditionedDamageEffect(),
    specializedAttackEffects: neutralSpecializedAttackEffects(),
    successiveAttackEffect: { stages: [] },
    triggeredDamageEffect: neutralTriggeredDamageEffect(),
    eventRecoveryEffect: neutralEventRecoveryEffect(),
    miscellaneousEffects: neutralMiscellaneousEffects(),
    specialDefenseEffects: neutralSpecialDefenseEffects(),
    attributeBonuses: {
      vigor: 0, mind: 0, endurance: 0, strength: 0, dexterity: 0,
      intelligence: 0, faith: 0, arcane: 0,
    },
    incomingDamageMultipliers: damageTypes(1),
    outgoingDamageMultipliers: damageTypes(1),
    skillDamageMultipliers: damageTypes(1),
    chargedAttackDamageMultipliers: damageTypes(1.1),
  },
};

function createWeaponDamageRequest(
  weaponId = "moonveil",
  upgradeLevel = 10,
  bossId?: string,
  attackId = "katana-1h-heavy-1",
) {
  return {
    weaponId,
    weaponVariantId: weaponId,
    upgradeLevel,
    attackId,
    stats: {
      strength: 12,
      dexterity: 30,
      intelligence: 70,
      faith: 8,
      arcane: 8,
    },
    ...(bossId ? { bossId } : {}),
  };
}

function createWeaponSkillDamageRequest(
  weaponId = "moonveil",
  skillAttackId = "transient-moonlight-light",
  bossId?: string,
) {
  return {
    weaponId,
    weaponVariantId: weaponId,
    upgradeLevel: 10,
    skillAttackId,
    stats: {
      strength: 12,
      dexterity: 30,
      intelligence: 70,
      faith: 8,
      arcane: 8,
    },
    ...(bossId ? { bossId } : {}),
  };
}

function createAshOfWarDamageRequest(weaponId = "longsword") {
  return {
    ...createWeaponSkillDamageRequest(weaponId, "square-off-light"),
    ashOfWarId: "square-off",
  };
}

function damageTypes(value: number) {
  return { physical: value, magic: value, fire: value, lightning: value, holy: value };
}

function statusResistanceBonuses() {
  return { poison: 0, rot: 0, bleed: 0, frost: 0, sleep: 0, madness: 0, deathBlight: 0 };
}

function utilityEffects() {
  return {
    itemDiscoveryRateBonus: 0,
    runeAcquisitionMultiplier: 1,
    memorySlotBonus: 0,
    staminaRecoverySpeedBonus: 0,
    poiseDamageMultiplier: 1,
    skillFpCostMultiplier: 1,
    spellFpCostMultiplier: 1,
    spellEffectDurationMultiplier: 1,
    castingSpeedVirtualDexterity: 0,
  };
}

function recoveryEffects() {
  return { hpFlaskRecoveryMultiplier: 1, fpFlaskRecoveryMultiplier: 1, hpRecoveryPerSecond: 0 };
}

function conditionalAttackDamageMultipliers() {
  return {
    counterattack: damageTypes(1),
    critical: damageTypes(1),
    finalChainAttack: damageTypes(1),
    mounted: damageTypes(1),
    jumping: damageTypes(1),
    guardCounter: damageTypes(1),
  };
}

function neutralHpConditionedDamageEffect() {
  return {
    activation: null,
    thresholdPercent: null,
    outgoingDamageMultipliers: damageTypes(1),
    incomingDamageMultipliers: damageTypes(1),
  };
}

function neutralSpecializedAttackEffects() {
  return {
    projectileRangeBonus: 0,
    rangedDamageMultipliers: damageTypes(1),
    roarAndBreathDamageMultipliers: damageTypes(1),
    chargedSpellAndSkillDamageMultipliers: damageTypes(1),
    throwablePotDamageMultipliers: damageTypes(1),
    perfumeDamageMultipliers: damageTypes(1),
  };
}

function neutralTriggeredDamageEffect() {
  return { trigger: null, durationSeconds: 0, damageMultipliers: damageTypes(1) };
}

function neutralEventRecoveryEffect() {
  return {
    trigger: null,
    accumulatorThreshold: null,
    maxHpRecoveryPercent: 0,
    flatHpRecovery: 0,
    flatFpRecovery: 0,
  };
}

function neutralMiscellaneousEffects() {
  return {
    silentMovement: false,
    fallDamageMultiplier: 1,
    enemyTargetPriorityModifier: 0,
    preventsRuneLoss: false,
    appearance: null,
  };
}

function neutralSpecialDefenseEffects() {
  return {
    criticalDamageMultipliers: damageTypes(1),
    dodgeEffectRefreshSeconds: 0,
    dodgeEffectDurationSeconds: 0,
    reducesHeadshotImpact: false,
    concealsAtDistanceWhileCrouching: false,
  };
}

function createBuffEffect(
  slot: SpellBuffEffect["slot"],
  durationSeconds: number,
  outgoingDamageMultipliers: SpellBuffEffect["outgoingDamageMultipliers"],
  weaponAddedDamageScaling = damageTypes(0),
  weaponAddedStatusBuildup: SpellBuffEffect["weaponAddedStatusBuildup"] = {
    poison: 0, rot: 0, bleed: 0, frost: 0, sleep: 0, madness: 0, deathBlight: 0,
  },
): SpellBuffEffect {
  return {
    slot, durationSeconds, outgoingDamageMultipliers, weaponAddedDamageScaling,
    weaponAddedStatusBuildup,
    limitations: [],
  };
}

function buffSpell(
  id: string,
  name: string,
  type: SpellData["type"],
  buffEffect: SpellBuffEffect,
): SpellData {
  return {
    id, name, type, buffEffect, sourceMagicId: id.length, fpCost: 10,
    chargedFpCost: null, sustainedFpCost: null, slotsRequired: 1,
    requirements: { intelligence: type === "sorcery" ? 10 : 0, faith: type === "incantation" ? 10 : 0, arcane: 0 },
    iconId: 1, calculationStatus: "supported", attack: null, chargedAttack: null,
  };
}

describe("POST /api/damage/calculate with MongoDB weapon data", () => {
  it("combines aura, body, and catalyst-scaled weapon buffs in calculation order", async () => {
    const response = await request(app).post("/api/damage/calculate").send({
      ...createWeaponDamageRequest("longsword", 10, undefined, "straight-sword-1h-light-1"),
      buffSpellIds: ["golden-vow", "flame-grant-me-strength"],
      weaponBuff: {
        spellId: "scholar-s-armament", catalystWeaponId: "moonveil",
        catalystVariantId: "moonveil", upgradeLevel: 10,
      },
    });
    expect(response.status).toBe(200);
    expect(response.body.data[0]).toMatchObject({
      buffs: [{ id: "golden-vow", slot: "aura" }, { id: "flame-grant-me-strength", slot: "body" }],
      weaponBuff: { id: "scholar-s-armament", addedDamage: { magic: 147 } },
      attackRating: { physical: 251, magic: 567, total: 818 },
      offensiveOutput: { physical: 346, magic: 652, total: 998 },
    });
  });

  it("rejects a weapon buff on an ineligible weapon", async () => {
    const response = await request(app).post("/api/damage/calculate").send({
      ...createWeaponDamageRequest(),
      weaponBuff: {
        spellId: "scholar-s-armament", catalystWeaponId: "moonveil",
        catalystVariantId: "moonveil", upgradeLevel: 10,
      },
    });
    expect(response.status).toBe(400);
  });

  it("returns flat per-hit status buildup added by a weapon buff", async () => {
    const response = await request(app).post("/api/damage/calculate").send({
      ...createWeaponDamageRequest("longsword", 10, undefined, "straight-sword-1h-light-1"),
      weaponBuff: {
        spellId: "frozen-armament", catalystWeaponId: "moonveil",
        catalystVariantId: "moonveil", upgradeLevel: 10,
      },
    });

    expect(response.status).toBe(200);
    expect(response.body.data[0].weaponBuff).toMatchObject({
      id: "frozen-armament",
      addedDamage: damageTypes(0),
      addedStatusBuildup: { frost: 63 },
    });
  });

  it("applies a verified active Ash-of-War weapon buff", async () => {
    const response = await request(app).post("/api/damage/calculate").send({
      ...createWeaponDamageRequest("longsword", 10, undefined, "straight-sword-1h-light-1"),
      skillBuffAshOfWarId: "cragblade",
    });

    expect(response.status).toBe(200);
    expect(response.body.data[0]).toMatchObject({
      attackRating: { physical: 288 },
      skillBuff: {
        id: "cragblade", durationSeconds: 60,
        attackPowerMultipliers: { physical: 1.15 }, poiseDamageMultiplier: 1.1,
      },
    });
  });

  it("rejects two buffs that occupy the same slot", async () => {
    const response = await request(app).post("/api/damage/calculate").send({
      ...createWeaponDamageRequest("longsword", 10, undefined, "straight-sword-1h-light-1"),
      buffSpellIds: ["flame-grant-me-strength", "test-body-buff"],
    });

    expect(response.status).toBe(400);
    expect(response.body.data).toEqual([]);
  });

  it("calculates attack rating from the active game version", async () => {
    const response = await request(app)
      .post("/api/damage/calculate")
      .send(createWeaponDamageRequest());

    expect(response.status).toBe(200);
    expect(response.body.data[0]).toMatchObject({
      weapon: {
        id: "moonveil",
        name: "Moonveil",
        gameVersion: REGULATION_TEST_GAME_VERSION,
        upgradeLevel: 10,
      },
      attack: {
        id: "katana-1h-heavy-1",
        name: "One-handed heavy attack 1",
      },
      attackRating: {
        physical: 251,
        magic: 420,
        total: 671,
      },
      offensiveOutput: {
        physical: 313,
        magic: 525,
        total: 838,
      },
    });
    expect(response.body.data[0]).not.toHaveProperty("damage");
  });

  it("uses a verified infused variant while keeping attacks on the canonical weapon", async () => {
    const standard = await WeaponVariantModel.findOne({ id: "longsword" }).lean();
    await WeaponVariantModel.create({ ...standard, _id: undefined, id: "longsword-heavy", sourceId: 1000100 });
    await WeaponCatalogModel.updateOne({ id: "longsword" }, {
      $push: { variants: { id: "longsword-heavy", sourceId: 1000100, affinity: "heavy" } },
    });

    const response = await request(app).post("/api/damage/calculate").send({
      ...createWeaponDamageRequest("longsword", 10, undefined, "straight-sword-1h-light-1"),
      weaponVariantId: "longsword-heavy",
    });

    expect(response.status).toBe(200);
    expect(response.body.data[0]).toMatchObject({
      weapon: { id: "longsword-heavy", affinity: "heavy" },
      attack: { id: "straight-sword-1h-light-1" },
    });
  });

  it("rejects a calculation variant belonging to another weapon", async () => {
    const response = await request(app).post("/api/damage/calculate").send({
      ...createWeaponDamageRequest("longsword", 10, undefined, "straight-sword-1h-light-1"),
      weaponVariantId: "moonveil",
    });

    expect(response.status).toBe(400);
  });

  it("applies verified permanent talisman attribute bonuses before attack rating", async () => {
    const response = await request(app)
      .post("/api/damage/calculate")
      .send({
        ...createWeaponDamageRequest(),
        talismanIds: ["starscourge-heirloom"],
      });

    expect(response.status).toBe(200);
    expect(response.body.data[0]).toMatchObject({
      stats: { strength: 12 },
      effectiveStats: { strength: 17 },
      talismans: [{ id: "starscourge-heirloom", name: "Starscourge Heirloom" }],
    });
    expect(response.body.data[0].attackRating.total).toBeGreaterThan(671);
  });

  it("applies Godrick's Great Rune before weapon scaling", async () => {
    const response = await request(app)
      .post("/api/damage/calculate")
      .send({
        ...createWeaponDamageRequest(),
        greatRuneId: "godricks-great-rune",
      });

    expect(response.status).toBe(200);
    expect(response.body.data[0]).toMatchObject({
      stats: { strength: 12, dexterity: 30, intelligence: 70, faith: 8, arcane: 8 },
      effectiveStats: { strength: 17, dexterity: 35, intelligence: 75, faith: 13, arcane: 13 },
      greatRune: { id: "godricks-great-rune", name: "Godrick's Great Rune" },
    });
    expect(response.body.data[0].attackRating.total).toBeGreaterThan(671);
  });

  it("combines Physick attribute and outgoing-damage Tears for weapon damage", async () => {
    const response = await request(app).post("/api/damage/calculate").send({
      ...createWeaponDamageRequest(),
      crystalTearIds: ["strength-knot-crystal-tear", "magic-shrouding-cracked-tear"],
    });
    expect(response.status).toBe(200);
    expect(response.body.data[0]).toMatchObject({
      effectiveStats: { strength: 22 },
      crystalTears: [
        { id: "strength-knot-crystal-tear" }, { id: "magic-shrouding-cracked-tear" },
      ],
    });
    expect(response.body.data[0].offensiveOutput.magic).toBeGreaterThan(525);
  });

  it("applies Spiked only to charged attacks and exposes Stonebarb poise scaling", async () => {
    const [baseline, physick] = await Promise.all([
      request(app).post("/api/damage/calculate").send(
        createWeaponDamageRequest("moonveil", 10, undefined, "katana-1h-charged-heavy-1"),
      ),
      request(app).post("/api/damage/calculate").send({
        ...createWeaponDamageRequest("moonveil", 10, undefined, "katana-1h-charged-heavy-1"),
        crystalTearIds: ["spiked-cracked-tear", "stonebarb-cracked-tear"],
      }),
    ]);
    expect(baseline.status).toBe(200);
    expect(physick.status).toBe(200);
    expect(physick.body.data[0].offensiveOutput.total).toBeGreaterThan(baseline.body.data[0].offensiveOutput.total);
    expect(physick.body.data[0].poiseDamageMultiplier).toBe(1.3);
  });

  it("rejects unknown and catalog-only Great Runes for weapon damage", async () => {
    const [unknown, unsupported] = await Promise.all([
      request(app).post("/api/damage/calculate").send({
        ...createWeaponDamageRequest(), greatRuneId: "unknown-rune",
      }),
      request(app).post("/api/damage/calculate").send({
        ...createWeaponDamageRequest(), greatRuneId: "rykards-great-rune",
      }),
    ]);

    expect(unknown.status).toBe(400);
    expect(unsupported.status).toBe(400);
  });

  it("rejects unknown or unsupported talisman selections", async () => {
    const response = await request(app)
      .post("/api/damage/calculate")
      .send({
        ...createWeaponDamageRequest(),
        talismanIds: ["unknown-talisman"],
      });

    expect(response.status).toBe(400);
    expect(response.body.data).toEqual([]);
  });

  it("applies a permanent talisman multiplier only to its damage type", async () => {
    const response = await request(app)
      .post("/api/damage/calculate")
      .send({
        ...createWeaponDamageRequest(),
        talismanIds: ["magic-scorpion-charm"],
      });

    expect(response.status).toBe(200);
    expect(response.body.data[0]).toMatchObject({
      attackRating: { physical: 251, magic: 420, total: 671 },
      offensiveOutput: { physical: 313, magic: 588, total: 901 },
    });
  });

  it("applies a supported armor multiplier only to its verified damage scope", async () => {
    const response = await request(app)
      .post("/api/damage/calculate")
      .send({ ...createWeaponDamageRequest(), armorIds: ["silver-tear-mask"] });

    expect(response.status).toBe(200);
    expect(response.body.data[0]).toMatchObject({
      armor: [{ id: "silver-tear-mask", name: "Silver Tear Mask", slot: "head" }],
      offensiveOutput: { physical: 298, magic: 525, total: 823 },
    });
  });

  it("applies a skill-only multiplier to skills but not normal attacks", async () => {
    const [skillResponse, normalResponse] = await Promise.all([
      request(app)
        .post("/api/damage/calculate")
        .send({
          ...createWeaponSkillDamageRequest(),
          talismanIds: ["shard-of-alexander"],
        }),
      request(app)
        .post("/api/damage/calculate")
        .send({
          ...createWeaponDamageRequest(),
          talismanIds: ["shard-of-alexander"],
        }),
    ]);

    expect(skillResponse.status).toBe(200);
    expect(skillResponse.body.data[0].offensiveOutput).toMatchObject({
      physical: 115,
      magic: 297,
      total: 412,
    });
    expect(normalResponse.status).toBe(200);
    expect(normalResponse.body.data[0].offensiveOutput).toMatchObject({
      physical: 313,
      magic: 525,
      total: 838,
    });
  });

  it("applies the Axe Talisman only to charged heavy attacks", async () => {
    const [chargedResponse, normalResponse] = await Promise.all([
      request(app)
        .post("/api/damage/calculate")
        .send({
          ...createWeaponDamageRequest("moonveil", 10, undefined, "katana-1h-charged-heavy-1"),
          talismanIds: ["axe-talisman"],
        }),
      request(app)
        .post("/api/damage/calculate")
        .send({
          ...createWeaponDamageRequest(),
          talismanIds: ["axe-talisman"],
        }),
    ]);

    expect(chargedResponse.status).toBe(200);
    expect(chargedResponse.body.data[0].offensiveOutput).toMatchObject({
      physical: 441,
      magic: 739,
      total: 1180,
    });
    expect(normalResponse.status).toBe(200);
    expect(normalResponse.body.data[0].offensiveOutput.total).toBe(838);
  });

  it("loads a selected boss and calculates damage against it", async () => {
    const response = await request(app)
      .post("/api/damage/calculate")
      .send(createWeaponDamageRequest("moonveil", 10, "test-boss"));

    expect(response.status).toBe(200);
    expect(response.body.data[0]).toMatchObject({
      target: { id: "test-boss", name: "Test Boss" },
      damage: { physical: 186, magic: 267, total: 453 },
    });
  });

  it("calculates a stored multi-component skill attack", async () => {
    const response = await request(app)
      .post("/api/damage/calculate")
      .send(createWeaponSkillDamageRequest());

    expect(response.status).toBe(200);
    expect(response.body.data[0]).toMatchObject({
      weapon: { id: "moonveil", name: "Moonveil" },
      attack: {
        id: "transient-moonlight-light",
        name: "Transient Moonlight (Light)",
        fpCost: 15,
      },
      components: [
        {
          kind: "projectile",
          offensiveOutput: { physical: 0, magic: 91, total: 91 },
        },
        {
          kind: "weapon-hit",
          offensiveOutput: { physical: 100, magic: 168, total: 268 },
        },
      ],
      offensiveOutput: { physical: 100, magic: 259, total: 359 },
    });
    expect(response.body.data[0]).not.toHaveProperty("damage");
  });

  it("calculates a stored skill attack against a selected boss", async () => {
    const response = await request(app)
      .post("/api/damage/calculate")
      .send(createWeaponSkillDamageRequest("moonveil", "transient-moonlight-light", "test-boss"));

    expect(response.status).toBe(200);
    expect(response.body.data[0]).toMatchObject({
      target: { id: "test-boss", name: "Test Boss" },
      damage: expect.objectContaining({ total: expect.any(Number) }),
    });
  });

  it("calculates a compatible catalog Ash of War with the selected weapon", async () => {
    const response = await request(app)
      .post("/api/damage/calculate")
      .send(createAshOfWarDamageRequest());

    expect(response.status).toBe(200);
    expect(response.body.data[0]).toMatchObject({
      weapon: { id: "longsword" },
      attack: { id: "square-off-light", fpCost: 6 },
      offensiveOutput: { physical: 502, magic: 840, total: 1342 },
    });
  });

  it("selects an Ash-of-War damage variant by weapon type", async () => {
    const response = await request(app)
      .post("/api/damage/calculate")
      .send({
        ...createWeaponSkillDamageRequest("longsword", "wild-strikes-loop-1"),
        ashOfWarId: "wild-strikes",
      });

    expect(response.status).toBe(200);
    expect(response.body.data[0]).toMatchObject({
      weapon: { id: "longsword" },
      attack: { id: "wild-strikes-loop-1", fpCost: 2 },
      offensiveOutput: { physical: 268, magic: 449, total: 717 },
    });
  });

  it("rejects an Ash of War incompatible with the selected weapon type", async () => {
    const response = await request(app)
      .post("/api/damage/calculate")
      .send(createAshOfWarDamageRequest("moonveil"));

    expect(response.status).toBe(404);
    expect(response.body.data).toEqual([]);
  });

  it("calculates a Straight Sword class attack without a boss", async () => {
    const response = await request(app)
      .post("/api/damage/calculate")
      .send(
        createWeaponDamageRequest(
          "longsword",
          10,
          undefined,
          "straight-sword-1h-light-1",
        ),
      );

    expect(response.status).toBe(200);
    expect(response.body.data[0]).toMatchObject({
      weapon: { id: "longsword", name: "Longsword" },
      attack: {
        id: "straight-sword-1h-light-1",
        name: "One-handed light attack 1",
      },
      attackRating: { physical: 251, magic: 420, total: 671 },
      offensiveOutput: { physical: 251, magic: 420, total: 671 },
    });
    expect(response.body.data[0]).not.toHaveProperty("damage");
  });

  it("uses a weapon-specific attack override", async () => {
    const response = await request(app)
      .post("/api/damage/calculate")
      .send(createWeaponDamageRequest("serpentbone-blade"));

    expect(response.status).toBe(200);
    expect(response.body.data[0]).toMatchObject({
      weapon: { id: "serpentbone-blade", name: "Serpentbone Blade" },
      attack: { id: "katana-1h-heavy-1" },
      attackRating: { physical: 251, magic: 420, total: 671 },
      offensiveOutput: { physical: 125, magic: 210, total: 335 },
    });
  });

  it("returns not found for an unsupported weapon attack", async () => {
    const response = await request(app)
      .post("/api/damage/calculate")
      .send(
        createWeaponDamageRequest(
          "moonveil",
          10,
          undefined,
          "unknown-attack",
        ),
      );

    expect(response.status).toBe(404);
    expect(response.body.data).toEqual([]);
  });

  it("rejects a valid attack that belongs to another weapon", async () => {
    const response = await request(app)
      .post("/api/damage/calculate")
      .send(
        createWeaponDamageRequest(
          "moonveil",
          10,
          undefined,
          "straight-sword-1h-light-1",
        ),
      );

    expect(response.status).toBe(404);
    expect(response.body.data).toEqual([]);
  });

  it("rejects a skill attack that does not belong to the selected weapon", async () => {
    const response = await request(app)
      .post("/api/damage/calculate")
      .send(createWeaponSkillDamageRequest("longsword"));

    expect(response.status).toBe(404);
    expect(response.body.data).toEqual([]);
  });

  it("rejects requests containing both normal and skill attack IDs", async () => {
    const response = await request(app)
      .post("/api/damage/calculate")
      .send({
        ...createWeaponDamageRequest(),
        skillAttackId: "transient-moonlight-light",
      });

    expect(response.status).toBe(400);
    expect(response.body.data).toEqual([]);
  });

  it("returns not found for an unknown boss", async () => {
    const response = await request(app)
      .post("/api/damage/calculate")
      .send(createWeaponDamageRequest("moonveil", 10, "unknown-boss"));

    expect(response.status).toBe(404);
    expect(response.body.data).toEqual([]);
  });

  it("does not use boss data from another game version", async () => {
    await BossModel.deleteMany({});
    await saveBossDataSet([boss], {
      gameVersion: "1.15.0",
      sourceHash: REGULATION_TEST_SOURCE_HASH,
    });

    const response = await request(app)
      .post("/api/damage/calculate")
      .send(createWeaponDamageRequest("moonveil", 10, "test-boss"));

    expect(response.status).toBe(404);
    expect(response.body.data).toEqual([]);
  });

  it("returns not found for an unknown weapon", async () => {
    const response = await request(app)
      .post("/api/damage/calculate")
      .send(createWeaponDamageRequest("unknown-weapon", 0));

    expect(response.status).toBe(404);
    expect(response.body.data).toEqual([]);
  });

  it("does not use weapon data from another game version", async () => {
    await Promise.all([
      WeaponCatalogModel.deleteMany({}),
      WeaponVariantModel.deleteMany({}),
      ReinforcementModel.deleteMany({}),
      ScalingCurveModel.deleteMany({}),
    ]);

    const olderDataSet = createRegulationWeaponCatalogFixture();
    Object.values(olderDataSet.calculationData.weapons).forEach((weapon) => {
      weapon.gameVersion = "1.15.0";
    });
    await saveWeaponCatalog(olderDataSet, {
      gameVersion: "1.15.0",
      sourceHash: REGULATION_TEST_SOURCE_HASH,
    });

    const response = await request(app)
      .post("/api/damage/calculate")
      .send(createWeaponDamageRequest());

    expect(response.status).toBe(404);
    expect(response.body.data).toEqual([]);
  });

  it("rejects an unsupported upgrade level", async () => {
    const response = await request(app)
      .post("/api/damage/calculate")
      .send(createWeaponDamageRequest("moonveil", 25));

    expect(response.status).toBe(400);
    expect(response.body.data).toEqual([]);
  });
});

describe("saved build damage calculation", () => {
  it("rejects conflicting buff slots while saving a build", async () => {
    const response = await request(authenticatedApp)
      .post("/api/me/builds")
      .set("x-test-user-id", "user-1")
      .send({
        name: "Invalid Buff Stack",
        level: 100,
        stats: {
          vigor: 40, mind: 20, endurance: 30, strength: 20,
          dexterity: 20, intelligence: 20, faith: 20, arcane: 20,
        },
        equipment: {
          buffSpellIds: ["flame-grant-me-strength", "test-body-buff"],
        },
      });

    expect(response.status).toBe(400);
    expect(response.body.data).toEqual([]);
  });

  it("persists buff selections and calculates from the owned build", async () => {
    const createResponse = await request(authenticatedApp)
      .post("/api/me/builds")
      .set("x-test-user-id", "user-1")
      .send({
        name: "Buffed Longsword",
        level: 150,
        stats: {
          vigor: 50, mind: 25, endurance: 30, strength: 80,
          dexterity: 80, intelligence: 80, faith: 80, arcane: 80,
        },
        equipment: {
          greatRuneId: "godricks-great-rune",
          weaponSlots: {
            rightHand1: {
              weaponId: "longsword", variantId: "longsword", upgradeLevel: 10,
              ashOfWarId: "square-off",
            },
            leftHand1: {
              weaponId: "longsword", variantId: "longsword", upgradeLevel: 10,
              ashOfWarId: "cragblade",
            },
          },
          armor: { headId: null, chestId: null, armsId: null, legsId: null },
          talismanIds: [],
          buffSpellIds: ["golden-vow"],
          weaponBuff: {
            spellId: "frozen-armament", catalystWeaponId: "moonveil",
            catalystVariantId: "moonveil", upgradeLevel: 10,
          },
        },
      });

    expect(createResponse.status).toBe(201);
    expect(createResponse.body.data[0].equipment).toMatchObject({
      greatRuneId: "godricks-great-rune",
      buffSpellIds: ["golden-vow"],
      weaponBuff: { spellId: "frozen-armament" },
      weaponSlots: {
        rightHand1: { ashOfWarId: "square-off" },
        leftHand1: { weaponId: "longsword", variantId: "longsword", ashOfWarId: "cragblade" },
      },
    });

    const damageResponse = await request(authenticatedApp)
      .post(`/api/me/builds/${createResponse.body.data[0].id}/calculate-damage`)
      .set("x-test-user-id", "user-1")
      .send({ weaponSlotId: "rightHand1", attackId: "straight-sword-1h-light-1" });

    expect(damageResponse.status).toBe(200);
    expect(damageResponse.body.data[0]).toMatchObject({
      effectiveStats: { strength: 85, dexterity: 85, intelligence: 85, faith: 85, arcane: 85 },
      greatRune: { id: "godricks-great-rune", name: "Godrick's Great Rune" },
      buffs: [{ id: "golden-vow", slot: "aura" }],
      weaponBuff: {
        id: "frozen-armament",
        addedStatusBuildup: { frost: 63 },
      },
    });

    const leftHandResponse = await request(authenticatedApp)
      .post(`/api/me/builds/${createResponse.body.data[0].id}/calculate-damage`)
      .set("x-test-user-id", "user-1")
      .send({
        weaponSlotId: "leftHand1", attackId: "straight-sword-1h-light-1",
      });
    expect(leftHandResponse.status).toBe(200);
  });

  it("activates the buff belonging to the selected saved weapon slot", async () => {
    const createResponse = await request(authenticatedApp)
      .post("/api/me/builds").set("x-test-user-id", "user-1").send({
        name: "Cragblade Build", level: 100,
        stats: {
          vigor: 40, mind: 20, endurance: 30, strength: 40,
          dexterity: 20, intelligence: 10, faith: 10, arcane: 10,
        },
        equipment: { weaponSlots: { rightHand1: {
          weaponId: "longsword", variantId: "longsword", upgradeLevel: 10,
          ashOfWarId: "cragblade",
        } } },
      });
    expect(createResponse.status).toBe(201);

    const response = await request(authenticatedApp)
      .post(`/api/me/builds/${createResponse.body.data[0].id}/calculate-damage`)
      .set("x-test-user-id", "user-1")
      .send({
        weaponSlotId: "rightHand1", attackId: "straight-sword-1h-light-1",
        skillBuffActive: true,
      });
    expect(response.status).toBe(200);
    expect(response.body.data[0].skillBuff).toMatchObject({ id: "cragblade" });
  });
});
