import type { CrystalTearEffects } from "./crystalTear.types";

export function combineCrystalTearEffects(effects: CrystalTearEffects[]) {
  return effects.reduce((total, effect) => ({
    attributeBonuses: {
      vigor: total.attributeBonuses.vigor + effect.attributeBonuses.vigor,
      mind: total.attributeBonuses.mind + effect.attributeBonuses.mind,
      endurance: total.attributeBonuses.endurance + effect.attributeBonuses.endurance,
      strength: total.attributeBonuses.strength + effect.attributeBonuses.strength,
      dexterity: total.attributeBonuses.dexterity + effect.attributeBonuses.dexterity,
      intelligence: total.attributeBonuses.intelligence + effect.attributeBonuses.intelligence,
      faith: total.attributeBonuses.faith + effect.attributeBonuses.faith,
      arcane: total.attributeBonuses.arcane + effect.attributeBonuses.arcane,
    },
    resourceMultipliers: {
      maxHp: multiply(total.resourceMultipliers.maxHp, effect.resourceMultipliers.maxHp),
      maxStamina: multiply(total.resourceMultipliers.maxStamina, effect.resourceMultipliers.maxStamina),
      maxEquipLoad: multiply(total.resourceMultipliers.maxEquipLoad, effect.resourceMultipliers.maxEquipLoad),
    },
    outgoingDamageMultipliers: {
      physical: multiply(total.outgoingDamageMultipliers.physical, effect.outgoingDamageMultipliers.physical),
      magic: multiply(total.outgoingDamageMultipliers.magic, effect.outgoingDamageMultipliers.magic),
      fire: multiply(total.outgoingDamageMultipliers.fire, effect.outgoingDamageMultipliers.fire),
      lightning: multiply(total.outgoingDamageMultipliers.lightning, effect.outgoingDamageMultipliers.lightning),
      holy: multiply(total.outgoingDamageMultipliers.holy, effect.outgoingDamageMultipliers.holy),
    },
    chargedAttackDamageMultipliers: multiplyDamage(total.chargedAttackDamageMultipliers, effect.chargedAttackDamageMultipliers),
    incomingDamageMultipliers: multiplyDamage(total.incomingDamageMultipliers, effect.incomingDamageMultipliers),
    fpCostMultipliers: {
      skill: multiply(total.fpCostMultipliers.skill, effect.fpCostMultipliers.skill),
      sorcery: multiply(total.fpCostMultipliers.sorcery, effect.fpCostMultipliers.sorcery),
      incantation: multiply(total.fpCostMultipliers.incantation, effect.fpCostMultipliers.incantation),
    },
    poiseDamageMultiplier: multiply(total.poiseDamageMultiplier, effect.poiseDamageMultiplier),
    staminaRecoverySpeedBonus: total.staminaRecoverySpeedBonus + effect.staminaRecoverySpeedBonus,
    statusResistanceBonuses: addStatus(total.statusResistanceBonuses, effect.statusResistanceBonuses),
    cleansesStatusBuildup: [...new Set([...total.cleansesStatusBuildup, ...effect.cleansesStatusBuildup])],
    recovery: {
      instantMaxHpPercent: total.recovery.instantMaxHpPercent + effect.recovery.instantMaxHpPercent,
      instantMaxFpPercent: total.recovery.instantMaxFpPercent + effect.recovery.instantMaxFpPercent,
      hpPerSecond: total.recovery.hpPerSecond + effect.recovery.hpPerSecond,
      hpRegenerationDurationSeconds: Math.max(total.recovery.hpRegenerationDurationSeconds, effect.recovery.hpRegenerationDurationSeconds),
    },
  }), {
    attributeBonuses: { vigor: 0, mind: 0, endurance: 0, strength: 0, dexterity: 0, intelligence: 0, faith: 0, arcane: 0 },
    resourceMultipliers: { maxHp: 1, maxStamina: 1, maxEquipLoad: 1 },
    outgoingDamageMultipliers: { physical: 1, magic: 1, fire: 1, lightning: 1, holy: 1 },
    chargedAttackDamageMultipliers: unitDamage(),
    incomingDamageMultipliers: unitDamage(),
    fpCostMultipliers: { skill: 1, sorcery: 1, incantation: 1 },
    poiseDamageMultiplier: 1,
    staminaRecoverySpeedBonus: 0,
    statusResistanceBonuses: { poison: 0, rot: 0, bleed: 0, frost: 0, sleep: 0, madness: 0, deathBlight: 0 },
    cleansesStatusBuildup: [] as CrystalTearEffects["cleansesStatusBuildup"],
    recovery: { instantMaxHpPercent: 0, instantMaxFpPercent: 0, hpPerSecond: 0, hpRegenerationDurationSeconds: 0 },
  });
}

function multiply(left: number, right: number) { return Number((left * right).toFixed(12)); }
function unitDamage() { return { physical: 1, magic: 1, fire: 1, lightning: 1, holy: 1 }; }
function multiplyDamage(left: ReturnType<typeof unitDamage>, right: ReturnType<typeof unitDamage>) {
  return { physical: multiply(left.physical, right.physical), magic: multiply(left.magic, right.magic), fire: multiply(left.fire, right.fire), lightning: multiply(left.lightning, right.lightning), holy: multiply(left.holy, right.holy) };
}
function addStatus(left: CrystalTearEffects["statusResistanceBonuses"], right: CrystalTearEffects["statusResistanceBonuses"]) {
  return { poison: left.poison + right.poison, rot: left.rot + right.rot, bleed: left.bleed + right.bleed, frost: left.frost + right.frost, sleep: left.sleep + right.sleep, madness: left.madness + right.madness, deathBlight: left.deathBlight + right.deathBlight };
}
