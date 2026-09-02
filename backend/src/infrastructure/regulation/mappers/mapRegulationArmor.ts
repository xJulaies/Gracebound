import type { ArmorData, ArmorRegenerationEffect, ArmorScopedDamageBoost, ArmorSlot } from "../../../features/armor/domain/armor.types";
import type { ArmorBehaviorRow, ArmorBulletRow, ArmorEffectRow, ArmorParamRow } from "../schemas/armor.schema";

const FIRST_DLC_PROTECTOR_ID = 5_000_000;
const CUT_CONTENT_PROTECTOR_IDS = new Set([920_000]);
const PLACEHOLDER_NAMES = new Set(["Head", "Body", "Arms", "Legs"]);
const SLOTS: Record<number, ArmorSlot> = { 0: "head", 1: "body", 2: "arms", 3: "legs" };
const SCOPED_EFFECTS = new Map<number, ArmorData["passiveEffects"]["scopedDamageBoosts"][number]["scope"]>([
  [6012000, "thorn-sorceries"], [6012010, "thorn-sorceries"], [6012020, "thorn-sorceries"],
  [6013000, "glintstone-weapon-skills"], [6013010, "glintstone-weapon-skills"], [6013020, "glintstone-weapon-skills"], [6013030, "glintstone-weapon-skills"], [6013110, "glintstone-weapon-skills"],
  [6030100, "ancestral-infant"], [6053010, "noble-presence"],
  [6057000, "crucible-incantations"], [6057010, "crucible-incantations"], [6057020, "crucible-incantations"], [6057030, "crucible-incantations"], [6057100, "crucible-incantations"], [6057110, "crucible-incantations"], [6057210, "crucible-incantations"], [6057310, "crucible-incantations"],
  [6058000, "glintstone-stars-sorceries"], [6058001, "stars-of-ruin"], [6058100, "comet-sorceries"], [6058101, "comet-azur"],
  [6082000, "envoy-bubble-skills"],
  [6097000, "omen-bairn-tools"], [6097001, "omen-bairn-tools"], [6097010, "omen-bairn-tools"], [6097011, "omen-bairn-tools"], [6097020, "omen-bairn-tools"], [6097021, "omen-bairn-tools"], [6097030, "omen-bairn-tools"], [6097031, "omen-bairn-tools"],
  [6101000, "cold-sorceries"], [6104000, "golden-order-incantations"], [6112000, "throwable-pots"],
  [6093010, "jumping-attacks"], [6109000, "all-physical-attacks"],
]);
const NON_GAMEPLAY_EFFECT_IDS = new Set([486, 1950, 1952, 1954, 1956, 1958]);

export function mapBaseGameArmor(
  rows: ArmorParamRow[],
  effects: ArmorEffectRow[] = [],
  supportingRows: { behaviors?: ArmorBehaviorRow[]; bullets?: ArmorBulletRow[] } = {},
): ArmorData[] {
  const effectsById = new Map(effects.map((effect) => [effect.ID, effect]));
  const behaviorsById = new Map((supportingRows.behaviors ?? []).map((row) => [row.ID, row]));
  const bulletsById = new Map((supportingRows.bullets ?? []).map((row) => [row.ID, row]));
  const armor = rows
    .filter((row) => row.ID < FIRST_DLC_PROTECTOR_ID
      && !CUT_CONTENT_PROTECTOR_IDS.has(row.ID)
      && row.Name.trim() !== ""
      && SLOTS[row.protectorCategory]
      && !PLACEHOLDER_NAMES.has(row.Name))
    .map((row) => ({
      id: slugify(row.Name),
      sourceProtectorId: row.ID,
      name: row.Name,
      slot: SLOTS[row.protectorCategory]!,
      iconId: row.iconIdM,
      weight: row.weight,
      poise: round(row.toughnessCorrectRate * 1_000),
      damageNegation: {
        physical: negation(row.neutralDamageCutRate),
        strike: negation(row.blowDamageCutRate),
        slash: negation(row.slashDamageCutRate),
        pierce: negation(row.thrustDamageCutRate),
        magic: negation(row.magicDamageCutRate),
        fire: negation(row.fireDamageCutRate),
        lightning: negation(row.thunderDamageCutRate),
        holy: negation(row.darkDamageCutRate),
      },
      resistances: {
        poison: row.resistPoison,
        rot: row.resistDisease,
        bleed: row.resistBlood,
        frost: row.resistFreeze,
        sleep: row.resistSleep,
        madness: row.resistMadness,
        deathBlight: row.resistCurse,
      },
      sourceEffectIds: sourceEffectIds(row),
      hasUnresolvedPassiveEffects: hasUnresolvedEffects(sourceEffectIds(row), effectsById, behaviorsById, bulletsById),
      passiveEffects: mapPassiveEffects(sourceEffectIds(row), effectsById, behaviorsById, bulletsById),
    }));
  if (new Set(armor.map(({ id }) => id)).size !== armor.length) throw new Error("Armor catalog contains duplicate IDs");
  return armor;
}

function hasUnresolvedEffects(
  ids: number[],
  effects: Map<number, ArmorEffectRow>,
  behaviors: Map<number, ArmorBehaviorRow>,
  bullets: Map<number, ArmorBulletRow>,
) {
  return ids.some((id) => {
    const effect = effects.get(id);
    if (!effect) return true;
    if (id === 6044000) return true;
    if (NON_GAMEPLAY_EFFECT_IDS.has(id) || SCOPED_EFFECTS.has(id)) return false;
    if (mapConditionalAttackBoost(effect, effects).length > 0) return false;
    if (mapRegenerationEffects(effect, effects, behaviors, bullets).length > 0) return false;
    return !hasMappedDirectEffect(effect);
  });
}

function hasMappedDirectEffect(effect: ArmorEffectRow) {
  return [
    effect.addLifeForceStatus, effect.addWillpowerStatus, effect.addEndureStatus,
    effect.addStrengthStatus, effect.addDexterityStatus, effect.addMagicStatus,
    effect.addFaithStatus, effect.addLuckStatus, effect.changePoisonResistPoint,
    effect.changeDiseaseResistPoint, effect.changeBloodResistPoint, effect.changeFreezeResistPoint,
    effect.changeSleepResistPoint, effect.changeMadnessResistPoint, effect.changeCurseResistPoint,
    effect.targetPriority, effect.physicsAttackPower,
  ].some((value) => value !== 0)
    || [
      effect.maxHpRate, effect.maxMpRate, effect.maxStaminaRate, effect.equipWeightChangeRate,
      effect.artsConsumptionRate, effect.magicConsumptionRate, effect.miracleConsumptionRate,
      effect.neutralDamageCutRate, effect.magicDamageCutRate, effect.fireDamageCutRate,
      effect.thunderDamageCutRate, effect.darkDamageCutRate, effect.changeHpEstusFlaskCorrectRate,
      effect.changeMpEstusFlaskCorrectRate, effect.hearingSearchEnemyRate,
    ].some((value) => value !== 1);
}

function sourceEffectIds(row: ArmorParamRow) {
  return [row.residentSpEffectId, row.residentSpEffectId2, row.residentSpEffectId3].filter((id) => id > 0);
}

function mapPassiveEffects(
  ids: number[],
  effects: Map<number, ArmorEffectRow>,
  behaviors: Map<number, ArmorBehaviorRow>,
  bullets: Map<number, ArmorBulletRow>,
) {
  const rows = ids.map((id) => {
    const effect = effects.get(id);
    if (!effect && effects.size > 0) throw new Error(`Missing SpEffectParam ${id} for armor`);
    return effect;
  }).filter((effect): effect is ArmorEffectRow => Boolean(effect));
  const multiply = (field: keyof ArmorEffectRow) => rows.reduce((total, effect) => total * Number(effect[field]), 1);
  const add = (field: keyof ArmorEffectRow) => rows.reduce((total, effect) => total + Number(effect[field]), 0);
  return {
    attributeBonuses: {
      vigor: add("addLifeForceStatus"), mind: add("addWillpowerStatus"), endurance: add("addEndureStatus"),
      strength: add("addStrengthStatus"), dexterity: add("addDexterityStatus"), intelligence: add("addMagicStatus"),
      faith: add("addFaithStatus"), arcane: add("addLuckStatus"),
    },
    resourceMultipliers: { maxHp: multiply("maxHpRate"), maxFp: multiply("maxMpRate"), maxStamina: multiply("maxStaminaRate"), maxEquipLoad: multiply("equipWeightChangeRate") },
    fpCostMultipliers: { skill: multiply("artsConsumptionRate"), sorcery: multiply("magicConsumptionRate"), incantation: multiply("miracleConsumptionRate") },
    incomingDamageMultipliers: { physical: multiply("neutralDamageCutRate"), magic: multiply("magicDamageCutRate"), fire: multiply("fireDamageCutRate"), lightning: multiply("thunderDamageCutRate"), holy: multiply("darkDamageCutRate") },
    statusResistanceBonuses: {
      poison: add("changePoisonResistPoint"), rot: add("changeDiseaseResistPoint"),
      bleed: add("changeBloodResistPoint"), frost: add("changeFreezeResistPoint"),
      sleep: add("changeSleepResistPoint"), madness: add("changeMadnessResistPoint"),
      deathBlight: add("changeCurseResistPoint"),
    },
    flaskRecoveryMultipliers: { hp: multiply("changeHpEstusFlaskCorrectRate"), fp: multiply("changeMpEstusFlaskCorrectRate") },
    conditionalAttackBoosts: rows.flatMap((effect) => mapConditionalAttackBoost(effect, effects)),
    regenerationEffects: rows.flatMap((effect) => mapRegenerationEffects(effect, effects, behaviors, bullets)),
    utilityEffects: {
      enemyHearingMultiplier: multiply("hearingSearchEnemyRate"),
      aggroPriorityModifier: add("targetPriority"),
      dodgeContactPhysicalDamage: add("physicsAttackPower"),
      reducesHeadshotImpact: rows.some(({ ID, stateInfo }) => ID === 6044000 && stateInfo === 450),
    },
    scopedDamageBoosts: rows.flatMap(mapScopedDamageBoost),
  };
}

function mapScopedDamageBoost(effect: ArmorEffectRow): ArmorScopedDamageBoost[] {
  const scope = SCOPED_EFFECTS.get(effect.ID);
  if (!scope) return [];
  if (scope === "jumping-attacks") {
    return [{ scope, damageMultipliers: enemyDamageMultipliers(effect) }];
  }
  if (scope === "all-physical-attacks") {
    return [{ scope, damageMultipliers: { physical: effect.physicsAttackPowerRate, magic: 1, fire: 1, lightning: 1, holy: 1 } }];
  }
  return [{ scope, damageMultipliers: {
    physical: effect.physicsAttackRate,
    magic: effect.magicAttackRate,
    fire: effect.fireAttackRate,
    lightning: effect.thunderAttackRate,
    holy: effect.darkAttackRate,
  } }];
}

function enemyDamageMultipliers(effect: ArmorEffectRow) {
  return {
    physical: effect.atkEnemyDmgCorrectRate_Physics,
    magic: effect.atkEnemyDmgCorrectRate_Magic,
    fire: effect.atkEnemyDmgCorrectRate_Fire,
    lightning: effect.atkEnemyDmgCorrectRate_Thunder,
    holy: effect.atkEnemyDmgCorrectRate_Dark,
  };
}

function mapRegenerationEffects(
  effect: ArmorEffectRow,
  effects: Map<number, ArmorEffectRow>,
  behaviors: Map<number, ArmorBehaviorRow>,
  bullets: Map<number, ArmorBulletRow>,
): ArmorRegenerationEffect[] {
  if (effect.conditionHp > 0 && effect.changeHpPoint < 0 && effect.motionInterval > 0) {
    return [{
      target: "wearer",
      hpPerSecond: round(-effect.changeHpPoint / effect.motionInterval),
      maximumHpPercent: effect.conditionHp,
      radius: null,
    }];
  }
  const behaviorEffect = effect.behaviorId >= 0
    ? effect
    : effects.get(effect.cycleOccurrenceSpEffectId);
  if (!behaviorEffect || behaviorEffect.behaviorId < 0) return [];
  const behavior = behaviors.get(behaviorEffect.behaviorId);
  if (!behavior) return [];
  if (behavior.refType !== 1) throw new Error(`Unexpected armor behavior reference type ${behavior.refType}`);
  const bullet = bullets.get(behavior.refId);
  if (!bullet) throw new Error(`Missing Bullet ${behavior.refId} for armor behavior ${behavior.ID}`);
  const healing = effects.get(bullet.spEffectId0);
  if (!healing) throw new Error(`Missing SpEffectParam ${bullet.spEffectId0} for armor bullet ${bullet.ID}`);
  if (healing.changeHpPoint >= 0 || healing.motionInterval <= 0) throw new Error(`Unexpected armor healing effect ${healing.ID}`);
  return [{
    target: "nearby-allies",
    hpPerSecond: round(-healing.changeHpPoint / healing.motionInterval),
    maximumHpPercent: null,
    radius: bullet.hitRadius,
  }];
}

function mapConditionalAttackBoost(effect: ArmorEffectRow, effects: Map<number, ArmorEffectRow>) {
  const trigger = {
    379: "blood-loss-nearby",
    380: "poison-or-rot-nearby",
    437: "madness-on-wearer",
  }[effect.invocationConditionsStateChange1] as "blood-loss-nearby" | "poison-or-rot-nearby" | "madness-on-wearer" | undefined;
  if (!trigger) return [];
  const boost = effects.get(effect.cycleOccurrenceSpEffectId);
  if (!boost) throw new Error(`Missing triggered SpEffectParam ${effect.cycleOccurrenceSpEffectId} for armor`);
  return [{
    trigger,
    durationSeconds: boost.effectEndurance,
    outgoingDamageMultipliers: {
      physical: boost.atkEnemyDmgCorrectRate_Physics,
      magic: boost.atkEnemyDmgCorrectRate_Magic,
      fire: boost.atkEnemyDmgCorrectRate_Fire,
      lightning: boost.atkEnemyDmgCorrectRate_Thunder,
      holy: boost.atkEnemyDmgCorrectRate_Dark,
    },
  }];
}

function negation(damageMultiplier: number) {
  return round(1 - damageMultiplier);
}

function round(value: number) {
  return Number(value.toFixed(6));
}

function slugify(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}
