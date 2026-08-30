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

const passThroughAuthentication: RequestHandler = (_req, _res, next) => {
  next();
};

const app = createApp({
  authenticationMiddleware: passThroughAuthentication,
  getAuthenticatedUserId: () => null,
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
    saveAshOfWarCatalog([squareOff, wildStrikes], {
      gameVersion: REGULATION_TEST_GAME_VERSION,
      sourceHash: REGULATION_TEST_SOURCE_HASH,
    }),
    saveTalismanCatalog([starscourgeHeirloom, magicScorpionCharm, shardOfAlexander, axeTalisman], {
      gameVersion: REGULATION_TEST_GAME_VERSION,
      sourceHash: REGULATION_TEST_SOURCE_HASH,
    }),
  ]);
});

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

describe("POST /api/damage/calculate with MongoDB weapon data", () => {
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
