import type { TalismanData } from "../../../features/talismans/domain/talisman.types";
import type { TalismanParamRow } from "../schemas/talismanParam.schema";
import type { TalismanEffectParamRow } from "../schemas/talismanEffectParam.schema";

const FIRST_DLC_TALISMAN_ID = 7000;
const ATTRIBUTE_TALISMAN_IDS = new Set([
  1050, 1051, 1060, 1070, 1080, 1090, 1220, 1221,
]);
const SCORPION_CHARM_IDS = new Set([2000, 2010, 2020, 2030]);
const SKILL_DAMAGE_TALISMAN_IDS = new Set([1230, 1231]);
const CHARGED_ATTACK_TALISMAN_IDS = new Set([2130]);
const RESOURCE_TALISMAN_IDS = new Set([
  1000, 1001, 1002,
  1010, 1011, 1012,
  1020, 1021, 1022,
  1030, 1031, 1032,
  1040, 1041, 1042,
]);
const STATUS_RESISTANCE_TALISMAN_IDS = new Set([
  1160, 1161,
  1170, 1171,
  1180, 1181,
  1190, 1191,
  1200, 1201,
]);
const SORCERY_DAMAGE_TALISMAN_IDS = new Set([3000, 3001]);
const INCANTATION_DAMAGE_TALISMAN_IDS = new Set([3040, 3050]);
const UTILITY_TALISMAN_IDS = new Set([1100, 1110, 1140, 1150, 1210, 6020]);
const SPELL_UTILITY_TALISMAN_IDS = new Set([3060, 3070, 3080]);
const RECOVERY_TALISMAN_IDS = new Set([5000, 5010, 5020]);
const GUARD_TALISMAN_IDS = new Set([2070, 4100]);
const INCOMING_DAMAGE_TALISMAN_IDS = new Set([6060]);
const CONDITIONAL_ATTACK_TALISMAN_IDS = new Set([2060, 2090, 2120, 2140, 2180, 2200]);
const HP_CONDITIONED_TALISMAN_IDS = new Set([2040, 2050, 4080, 4090]);
const SPECIALIZED_ATTACK_TALISMAN_IDS = new Set([
  2100, 2150, 2190, 2210, 2220, 3090,
]);
const SUCCESSIVE_ATTACK_TALISMAN_IDS = new Set([1250, 2080, 2081]);
const TRIGGERED_DAMAGE_TALISMAN_IDS = new Set([2160, 2170]);
const EVENT_RECOVERY_TALISMAN_IDS = new Set([5030, 5040, 5050, 5060, 6110]);
const MISCELLANEOUS_TALISMAN_IDS = new Set([6000, 6040, 6050, 6070, 6080, 6090]);
const SPECIAL_DEFENSE_TALISMAN_IDS = new Set([4060, 4070, 4110, 6010]);
const DAMAGE_NEGATION_TALISMAN_IDS = new Set([
  4000, 4001, 4002, 4003,
  4010, 4011, 4012,
  4020, 4021, 4022,
  4030, 4031, 4032,
  4040, 4041, 4042,
  4050, 4051, 4052,
]);

export function mapBaseGameTalismans(
  rows: TalismanParamRow[],
  effectRows: TalismanEffectParamRow[] = [],
): TalismanData[] {
  const effectsById = new Map(effectRows.map((effect) => [effect.ID, effect]));
  const talismans = rows
    .filter(({ ID, Name }) => ID < FIRST_DLC_TALISMAN_ID && Name.trim() !== "")
    .map((row) => {
      const effect = ATTRIBUTE_TALISMAN_IDS.has(row.ID) ||
        RESOURCE_TALISMAN_IDS.has(row.ID) ||
        STATUS_RESISTANCE_TALISMAN_IDS.has(row.ID) ||
        SORCERY_DAMAGE_TALISMAN_IDS.has(row.ID) ||
        INCANTATION_DAMAGE_TALISMAN_IDS.has(row.ID) ||
        UTILITY_TALISMAN_IDS.has(row.ID) ||
        SPELL_UTILITY_TALISMAN_IDS.has(row.ID) ||
        RECOVERY_TALISMAN_IDS.has(row.ID) ||
        GUARD_TALISMAN_IDS.has(row.ID) ||
        INCOMING_DAMAGE_TALISMAN_IDS.has(row.ID) ||
        CONDITIONAL_ATTACK_TALISMAN_IDS.has(row.ID) ||
        HP_CONDITIONED_TALISMAN_IDS.has(row.ID) ||
        SPECIALIZED_ATTACK_TALISMAN_IDS.has(row.ID) ||
        SUCCESSIVE_ATTACK_TALISMAN_IDS.has(row.ID) ||
        TRIGGERED_DAMAGE_TALISMAN_IDS.has(row.ID) ||
        EVENT_RECOVERY_TALISMAN_IDS.has(row.ID) ||
        MISCELLANEOUS_TALISMAN_IDS.has(row.ID) ||
        SPECIAL_DEFENSE_TALISMAN_IDS.has(row.ID) ||
        SCORPION_CHARM_IDS.has(row.ID) ||
        SKILL_DAMAGE_TALISMAN_IDS.has(row.ID) ||
        CHARGED_ATTACK_TALISMAN_IDS.has(row.ID) ||
        DAMAGE_NEGATION_TALISMAN_IDS.has(row.ID)
        ? mapPermanentEffect(row, effectsById)
        : null;
      return {
      id: slugify(row.Name),
      sourceAccessoryId: row.ID,
      name: row.Name,
      iconId: row.iconId,
      weight: row.weight,
      sourceEffectId: row.refId,
        calculationStatus: effect ? "supported" as const : "catalog-only" as const,
        effects: effect,
      };
    });

  const ids = new Set(talismans.map(({ id }) => id));
  if (ids.size !== talismans.length) {
    throw new Error("Talisman catalog contains duplicate IDs");
  }
  return talismans;
}

function mapPermanentEffect(
  talisman: TalismanParamRow,
  effectsById: Map<number, TalismanEffectParamRow>,
) {
  const effect = effectsById.get(talisman.refId);
  if (!effect) throw new Error(`Missing SpEffectParam ${talisman.refId} for ${talisman.Name}`);
  const isScorpionCharm = SCORPION_CHARM_IDS.has(talisman.ID);
  const isSkillDamageTalisman = SKILL_DAMAGE_TALISMAN_IDS.has(talisman.ID);
  const isChargedAttackTalisman = CHARGED_ATTACK_TALISMAN_IDS.has(talisman.ID);
  const isDamageNegationTalisman = DAMAGE_NEGATION_TALISMAN_IDS.has(talisman.ID);
  const isSorceryDamageTalisman = SORCERY_DAMAGE_TALISMAN_IDS.has(talisman.ID);
  const isIncantationDamageTalisman = INCANTATION_DAMAGE_TALISMAN_IDS.has(talisman.ID);
  const hasConditionallyScopedDamage =
    CONDITIONAL_ATTACK_TALISMAN_IDS.has(talisman.ID) ||
    HP_CONDITIONED_TALISMAN_IDS.has(talisman.ID);
  return {
    resourceMultipliers: {
      maxHp: effect.maxHpRate,
      maxFp: effect.maxMpRate,
      maxStamina: effect.maxStaminaRate,
      maxEquipLoad: effect.equipWeightChangeRate,
    },
    statusResistanceBonuses: {
      poison: effect.changePoisonResistPoint,
      rot: effect.changeDiseaseResistPoint,
      bleed: effect.changeBloodResistPoint,
      frost: effect.changeFreezeResistPoint,
      sleep: effect.changeSleepResistPoint,
      madness: effect.changeMadnessResistPoint,
      deathBlight: effect.changeCurseResistPoint,
    },
    spellDamageMultipliers: {
      sorcery: isSorceryDamageTalisman ? effect.magicAttackRate : 1,
      incantation: isIncantationDamageTalisman ? effect.magicAttackRate : 1,
    },
    utilityEffects: {
      itemDiscoveryRateBonus: effect.itemDropRate,
      runeAcquisitionMultiplier: effect.soulRate,
      memorySlotBonus: effect.changeMagicSlot,
      staminaRecoverySpeedBonus: effect.staminaRecoverChangeSpeed,
      poiseDamageMultiplier: effect.toughnessDamageCutRate,
      skillFpCostMultiplier: effect.artsConsumptionRate,
      spellFpCostMultiplier: effect.magicConsumptionRate,
      spellEffectDurationMultiplier: effect.extendLifeRate,
      castingSpeedVirtualDexterity: effect.dexterityCancelSystemOnlyAddDexterity,
    },
    recoveryEffects: {
      hpFlaskRecoveryMultiplier: effect.changeHpEstusFlaskCorrectRate,
      fpFlaskRecoveryMultiplier: effect.changeMpEstusFlaskCorrectRate,
      hpRecoveryPerSecond: effect.motionInterval > 0
        ? Math.max(0, -effect.changeHpPoint / effect.motionInterval)
        : 0,
    },
    guardEffects: {
      staminaDamageMultiplier: effect.staminaAttackRate,
      staminaCostMultiplier: effect.guardStaminaMult,
    },
    conditionalAttackDamageMultipliers: {
      counterattack: talisman.ID === 2060 ? attackRateMultipliers(effect) : neutralDamageTypes(),
      critical: talisman.ID === 2090 ? attackRateMultipliers(effect) : neutralDamageTypes(),
      finalChainAttack: talisman.ID === 2120 ? enemyDamageMultipliers(effect) : neutralDamageTypes(),
      mounted: talisman.ID === 2140 ? attackRateMultipliers(effect) : neutralDamageTypes(),
      jumping: talisman.ID === 2180 ? enemyDamageMultipliers(effect) : neutralDamageTypes(),
      guardCounter: talisman.ID === 2200 ? attackRateMultipliers(effect) : neutralDamageTypes(),
    },
    hpConditionedDamageEffect: mapHpConditionedDamageEffect(talisman.ID, effect),
    specializedAttackEffects: {
      projectileRangeBonus: talisman.ID === 2100 ? effect.bowDistRate : 0,
      rangedDamageMultipliers: talisman.ID === 2150
        ? attackRateMultipliers(effect)
        : neutralDamageTypes(),
      roarAndBreathDamageMultipliers: talisman.ID === 2190
        ? attackRateMultipliers(effect)
        : neutralDamageTypes(),
      chargedSpellAndSkillDamageMultipliers: talisman.ID === 3090
        ? attackRateMultipliers(effect)
        : neutralDamageTypes(),
      throwablePotDamageMultipliers: talisman.ID === 2210
        ? attackRateMultipliers(effect)
        : neutralDamageTypes(),
      perfumeDamageMultipliers: talisman.ID === 2220
        ? attackRateMultipliers(effect)
        : neutralDamageTypes(),
    },
    successiveAttackEffect: {
      stages: mapSuccessiveAttackStages(talisman.ID, effectsById),
    },
    triggeredDamageEffect: mapTriggeredDamageEffect(talisman.ID, effect, effectsById),
    eventRecoveryEffect: mapEventRecoveryEffect(talisman.ID, effect, effectsById),
    miscellaneousEffects: mapMiscellaneousEffects(talisman.ID, effect),
    specialDefenseEffects: mapSpecialDefenseEffects(talisman.ID, effect, effectsById),
    attributeBonuses: {
      vigor: effect.addLifeForceStatus,
      mind: effect.addWillpowerStatus,
      endurance: effect.addEndureStatus,
      strength: effect.addStrengthStatus,
      dexterity: effect.addDexterityStatus,
      intelligence: effect.addMagicStatus,
      faith: effect.addFaithStatus,
      arcane: effect.addLuckStatus,
    },
    incomingDamageMultipliers: {
      physical: isScorpionCharm
        ? effect.defEnemyDmgCorrectRate_Physics
        : isDamageNegationTalisman
          ? effect.defEnemyDmgCorrectRate_Physics
        : effect.neutralDamageCutRate,
      magic: isScorpionCharm
        ? 1
        : isDamageNegationTalisman
          ? effect.defEnemyDmgCorrectRate_Magic
          : effect.magicDamageCutRate,
      fire: isScorpionCharm
        ? 1
        : isDamageNegationTalisman
          ? effect.defEnemyDmgCorrectRate_Fire
          : effect.fireDamageCutRate,
      lightning: isScorpionCharm
        ? 1
        : isDamageNegationTalisman
          ? effect.defEnemyDmgCorrectRate_Thunder
          : effect.thunderDamageCutRate,
      holy: isScorpionCharm
        ? 1
        : isDamageNegationTalisman
          ? effect.defEnemyDmgCorrectRate_Dark
          : effect.darkDamageCutRate,
    },
    outgoingDamageMultipliers: hasConditionallyScopedDamage
      ? neutralDamageTypes()
      : enemyDamageMultipliers(effect),
    skillDamageMultipliers: {
      physical: isSkillDamageTalisman ? effect.physicsAttackRate : 1,
      magic: isSkillDamageTalisman ? effect.magicAttackRate : 1,
      fire: isSkillDamageTalisman ? effect.fireAttackRate : 1,
      lightning: isSkillDamageTalisman ? effect.thunderAttackRate : 1,
      holy: isSkillDamageTalisman ? effect.darkAttackRate : 1,
    },
    chargedAttackDamageMultipliers: {
      physical: isChargedAttackTalisman ? effect.physicsAttackRate : 1,
      magic: isChargedAttackTalisman ? effect.magicAttackRate : 1,
      fire: isChargedAttackTalisman ? effect.fireAttackRate : 1,
      lightning: isChargedAttackTalisman ? effect.thunderAttackRate : 1,
      holy: isChargedAttackTalisman ? effect.darkAttackRate : 1,
    },
  };
}

function mapSpecialDefenseEffects(
  talismanId: number,
  effect: TalismanEffectParamRow,
  effectsById: Map<number, TalismanEffectParamRow>,
) {
  const expectedStates = new Map([[4060, 335], [4070, 290], [4110, 450], [6010, 466]]);
  const expectedState = expectedStates.get(talismanId);
  if (expectedState !== undefined) {
    const actualState = talismanId === 6010
      ? effect.invocationConditionsStateChange1
      : effect.stateInfo;
    if (actualState !== expectedState) {
      throw new Error(`Unexpected special-defense state for talisman ${talismanId}`);
    }
  }
  if (talismanId === 6010 && effect.vfxId !== 360100) {
    throw new Error("Unexpected Concealing Veil effect");
  }
  const dodgeEffect = talismanId === 4070
    ? effectsById.get(effect.cycleOccurrenceSpEffectId)
    : undefined;
  if (talismanId === 4070 && !dodgeEffect) {
    throw new Error(`Missing dodge SpEffectParam ${effect.cycleOccurrenceSpEffectId}`);
  }
  return {
    criticalDamageMultipliers: talismanId === 4060
      ? {
          physical: effect.neutralDamageCutRate,
          magic: effect.magicDamageCutRate,
          fire: effect.fireDamageCutRate,
          lightning: effect.thunderDamageCutRate,
          holy: effect.darkDamageCutRate,
        }
      : neutralDamageTypes(),
    dodgeEffectRefreshSeconds: talismanId === 4070 ? effect.motionInterval : 0,
    dodgeEffectDurationSeconds: dodgeEffect
      ? Math.max(0, dodgeEffect.effectEndurance)
      : 0,
    reducesHeadshotImpact: talismanId === 4110,
    concealsAtDistanceWhileCrouching: talismanId === 6010,
  };
}

function mapMiscellaneousEffects(
  talismanId: number,
  effect: TalismanEffectParamRow,
) {
  if (talismanId === 6000 && (effect.stateInfo !== 54 || effect.hearingSearchEnemyRate !== 0)) {
    throw new Error("Unexpected Crepus's Vial stealth effect");
  }
  if (talismanId === 6070 && effect.stateInfo !== 159) {
    throw new Error("Unexpected Sacrificial Twig effect");
  }
  if (talismanId === 6080 && effect.vfxId !== 360800) {
    throw new Error("Unexpected Furled Finger mirror effect");
  }
  if (talismanId === 6090 && effect.vfxId !== 360900) {
    throw new Error("Unexpected Host mirror effect");
  }
  return {
    silentMovement: talismanId === 6000,
    fallDamageMultiplier: talismanId === 6040 ? effect.fallDamageRate : 1,
    enemyTargetPriorityModifier: talismanId === 6050 ? effect.targetPriority : 0,
    preventsRuneLoss: talismanId === 6070,
    appearance: talismanId === 6080
      ? "host" as const
      : talismanId === 6090
        ? "cooperator" as const
        : null,
  };
}

function mapEventRecoveryEffect(
  talismanId: number,
  effect: TalismanEffectParamRow,
  effectsById: Map<number, TalismanEffectParamRow>,
) {
  const definitions = new Map([
    [5030, { trigger: "enemy-kill" as const, effectId: 350301 }],
    [5040, { trigger: "successive-attacks" as const, effectId: 350401 }],
    [5050, { trigger: "critical-hit" as const, effectId: 350502 }],
    [5060, { trigger: "critical-hit" as const, effectId: 350602 }],
    [6110, { trigger: "enemy-kill" as const, effectId: 361101 }],
  ]);
  const definition = definitions.get(talismanId);
  if (!definition) {
    return {
      trigger: null, accumulatorThreshold: null,
      maxHpRecoveryPercent: 0, flatHpRecovery: 0, flatFpRecovery: 0,
    };
  }
  const recovery = effectsById.get(definition.effectId);
  if (!recovery) throw new Error(`Missing recovery SpEffectParam ${definition.effectId}`);
  return {
    trigger: definition.trigger,
    accumulatorThreshold: definition.trigger === "successive-attacks"
      ? effect.accumuOverVal
      : null,
    maxHpRecoveryPercent: Math.max(0, -recovery.changeHpRate),
    flatHpRecovery: Math.max(0, -recovery.changeHpPoint),
    flatFpRecovery: Math.max(0, -recovery.changeMpPoint),
  };
}

function mapTriggeredDamageEffect(
  talismanId: number,
  effect: TalismanEffectParamRow,
  effectsById: Map<number, TalismanEffectParamRow>,
) {
  const trigger = talismanId === 2160
    ? "blood-loss-nearby" as const
    : talismanId === 2170
      ? "poison-or-rot-nearby" as const
      : null;
  if (!trigger) {
    return { trigger: null, durationSeconds: 0, damageMultipliers: neutralDamageTypes() };
  }
  const expectedStateChange = talismanId === 2160 ? 379 : 380;
  if (effect.invocationConditionsStateChange1 !== expectedStateChange) {
    throw new Error(`Unexpected trigger state for talisman ${talismanId}`);
  }
  const triggeredEffect = effectsById.get(effect.cycleOccurrenceSpEffectId);
  if (!triggeredEffect) {
    throw new Error(`Missing triggered SpEffectParam ${effect.cycleOccurrenceSpEffectId}`);
  }
  return {
    trigger,
    durationSeconds: Math.max(0, triggeredEffect.effectEndurance),
    damageMultipliers: enemyDamageMultipliers(triggeredEffect),
  };
}

function mapSuccessiveAttackStages(
  talismanId: number,
  effectsById: Map<number, TalismanEffectParamRow>,
) {
  const definitions = talismanId === 1250
    ? { triggerIds: [312501, 312502, 312503, 312504], boostIds: [312505, 312506, 312507, 312508] }
    : talismanId === 2080
      ? { triggerIds: [320801, 320802, 320803], boostIds: [320804, 320805, 320806] }
      : talismanId === 2081
        ? { triggerIds: [320811, 320812, 320813], boostIds: [320814, 320815, 320816] }
        : null;
  if (!definitions) return [];

  return definitions.triggerIds.map((triggerId, index) => {
    const trigger = effectsById.get(triggerId);
    const boostId = definitions.boostIds[index]!;
    const boost = effectsById.get(boostId);
    if (!trigger || !boost) {
      throw new Error(`Missing successive-attack SpEffectParam ${triggerId}/${boostId}`);
    }
    return {
      accumulatorThreshold: trigger.accumuOverVal,
      durationSeconds: Math.max(0, boost.effectEndurance),
      damageMultipliers: enemyDamageMultipliers(boost),
    };
  });
}

function mapHpConditionedDamageEffect(
  talismanId: number,
  effect: TalismanEffectParamRow,
) {
  const isLowHp = talismanId === 2040 || talismanId === 4080;
  const isFullHp = talismanId === 2050 || talismanId === 4090;
  const isOutgoing = talismanId === 2040 || talismanId === 2050;
  const isIncoming = talismanId === 4080 || talismanId === 4090;
  return {
    activation: isLowHp ? "low-hp" as const : isFullHp ? "full-hp" as const : null,
    thresholdPercent: isLowHp
      ? effect.conditionHp
      : isFullHp
        ? effect.conditionHpRate
        : null,
    outgoingDamageMultipliers: isOutgoing
      ? enemyDamageMultipliers(effect)
      : neutralDamageTypes(),
    incomingDamageMultipliers: isIncoming
      ? defensiveEnemyDamageMultipliers(effect)
      : neutralDamageTypes(),
  };
}

function attackRateMultipliers(effect: TalismanEffectParamRow) {
  return {
    physical: effect.physicsAttackRate,
    magic: effect.magicAttackRate,
    fire: effect.fireAttackRate,
    lightning: effect.thunderAttackRate,
    holy: effect.darkAttackRate,
  };
}

function enemyDamageMultipliers(effect: TalismanEffectParamRow) {
  return {
    physical: effect.atkEnemyDmgCorrectRate_Physics,
    magic: effect.atkEnemyDmgCorrectRate_Magic,
    fire: effect.atkEnemyDmgCorrectRate_Fire,
    lightning: effect.atkEnemyDmgCorrectRate_Thunder,
    holy: effect.atkEnemyDmgCorrectRate_Dark,
  };
}

function defensiveEnemyDamageMultipliers(effect: TalismanEffectParamRow) {
  return {
    physical: effect.defEnemyDmgCorrectRate_Physics,
    magic: effect.defEnemyDmgCorrectRate_Magic,
    fire: effect.defEnemyDmgCorrectRate_Fire,
    lightning: effect.defEnemyDmgCorrectRate_Thunder,
    holy: effect.defEnemyDmgCorrectRate_Dark,
  };
}

function neutralDamageTypes() {
  return { physical: 1, magic: 1, fire: 1, lightning: 1, holy: 1 };
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/\+/g, " plus ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}
