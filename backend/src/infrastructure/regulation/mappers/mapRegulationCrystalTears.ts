import type { CrystalTearData } from "../../../features/crystalTears/domain/crystalTear.types";
import type { ArmorEffectRow } from "../schemas/armor.schema";
import type { CrystalTearGoodsRow } from "../schemas/crystalTear.schema";

const SUPPORTED_IDS = new Set([11000, 11001, 11002, 11003, 11004, 11005, 11006, 11009, 11010, 11011, 11012, 11014, 11021, 11022, 11023, 11024, 11025, 11026, 11028, 11029, 11030, 11031]);

export function mapRegulationCrystalTears(goods: CrystalTearGoodsRow[], effects: ArmorEffectRow[]): CrystalTearData[] {
  const rows = goods.filter(({ ID }) => ID >= 11000 && ID <= 11031);
  if (rows.length !== 32) throw new Error(`Expected 32 base-game Crystal Tears, found ${rows.length}`);
  return rows.map((row) => {
    const rootEffect = effects.find(({ ID }) => ID === row.refId_default);
    if (!rootEffect) throw new Error(`Missing Crystal Tear effect ${row.refId_default}`);
    const effect = row.ID === 11006
      ? effects.find(({ ID }) => ID === 3604)
      : rootEffect;
    if (!effect) throw new Error("Missing Speckled Hardtear resistance effect 3604");
    if (row.ID === 11006) validateSpeckledCleanseChain(effects);
    const supported = SUPPORTED_IDS.has(row.ID);
    return {
      id: tearId(row), sourceGoodsId: row.ID, sourceEffectId: rootEffect.ID, name: row.Name, iconId: row.iconId,
      calculationStatus: supported ? "supported" : "catalog-only",
      effects: supported ? {
        durationSeconds: effect.effectEndurance,
        attributeBonuses: { vigor: effect.addLifeForceStatus, mind: effect.addWillpowerStatus, endurance: effect.addEndureStatus, strength: effect.addStrengthStatus, dexterity: effect.addDexterityStatus, intelligence: effect.addMagicStatus, faith: effect.addFaithStatus, arcane: effect.addLuckStatus },
        resourceMultipliers: { maxHp: effect.maxHpRate, maxStamina: effect.maxStaminaRate, maxEquipLoad: effect.equipWeightChangeRate },
        outgoingDamageMultipliers: { physical: effect.atkEnemyDmgCorrectRate_Physics, magic: effect.atkEnemyDmgCorrectRate_Magic, fire: effect.atkEnemyDmgCorrectRate_Fire, lightning: effect.atkEnemyDmgCorrectRate_Thunder, holy: effect.atkEnemyDmgCorrectRate_Dark },
        chargedAttackDamageMultipliers: { physical: effect.physicsAttackRate, magic: effect.magicAttackRate, fire: effect.fireAttackRate, lightning: effect.thunderAttackRate, holy: effect.darkAttackRate },
        incomingDamageMultipliers: { physical: effect.defEnemyDmgCorrectRate_Physics, magic: effect.defEnemyDmgCorrectRate_Magic, fire: effect.defEnemyDmgCorrectRate_Fire, lightning: effect.defEnemyDmgCorrectRate_Thunder, holy: effect.defEnemyDmgCorrectRate_Dark },
        fpCostMultipliers: { skill: effect.artsConsumptionRate, sorcery: effect.magicConsumptionRate, incantation: effect.miracleConsumptionRate },
        poiseDamageMultiplier: effect.saAttackPowerRate ?? 1,
        staminaRecoverySpeedBonus: effect.staminaRecoverChangeSpeed,
        statusResistanceBonuses: { poison: effect.changePoisonResistPoint, rot: effect.changeDiseaseResistPoint, bleed: effect.changeBloodResistPoint, frost: effect.changeFreezeResistPoint, sleep: effect.changeSleepResistPoint, madness: effect.changeMadnessResistPoint, deathBlight: effect.changeCurseResistPoint },
        cleansesStatusBuildup: row.ID === 11006 ? ["poison", "rot", "bleed", "frost", "sleep", "madness", "deathBlight"] : [],
        recovery: {
          instantMaxHpPercent: Math.abs(effect.changeHpRate) / 100,
          instantMaxFpPercent: Math.abs(effect.changeMpRate) / 100,
          hpPerSecond: Math.abs(effect.changeHpPoint),
          hpRegenerationDurationSeconds: effect.changeHpPoint === 0 ? 0 : effect.effectEndurance,
        },
      } : null,
      limitations: supported ? [] : ["This Crystal Tear requires a separately verified combat rule."],
    };
  });
}

function validateSpeckledCleanseChain(effects: ArmorEffectRow[]) {
  const fields = ["bloodAttackPower", "sleepAttackPower", "poizonAttackPower", "madnessAttackPower", "diseaseAttackPower", "freezeAttackPower", "curseAttackPower"] as const;
  fields.forEach((field, index) => {
    const effect = effects.find(({ ID }) => ID === 3612 + index);
    if (!effect || effect[field] > -99999) throw new Error(`Invalid Speckled Hardtear cleanse effect ${3612 + index}`);
  });
}

function tearId(row: CrystalTearGoodsRow) {
  const base = row.Name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  if (row.ID === 11002 || row.ID === 11003) return `${base}-${row.ID - 11001}`;
  if (row.ID === 11004 || row.ID === 11005) return `${base}-${row.ID - 11003}`;
  if (row.ID === 11016 || row.ID === 11017) return `${base}-${row.ID - 11015}`;
  return base;
}
