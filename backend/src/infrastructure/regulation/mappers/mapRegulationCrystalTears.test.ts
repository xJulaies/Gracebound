import { describe, expect, it } from "vitest";
import type { ArmorEffectRow } from "../schemas/armor.schema";
import { mapRegulationCrystalTears } from "./mapRegulationCrystalTears";

describe("mapRegulationCrystalTears", () => {
  it("maps all base-game Tears and only directly verified effects", () => {
    const tears = mapRegulationCrystalTears(goods, effects);
    expect(tears).toHaveLength(32);
    expect(tears.filter(({ calculationStatus }) => calculationStatus === "supported")).toHaveLength(22);
    expect(tears.find(({ id }) => id === "strength-knot-crystal-tear")?.effects)
      .toMatchObject({ durationSeconds: 180, attributeBonuses: { strength: 10 } });
    expect(tears.find(({ id }) => id === "magic-shrouding-cracked-tear")?.effects)
      .toMatchObject({ outgoingDamageMultipliers: { magic: 1.2 } });
    expect(tears.find(({ id }) => id === "spiked-cracked-tear")?.effects)
      .toMatchObject({ chargedAttackDamageMultipliers: { physical: 1.15 } });
    expect(tears.find(({ id }) => id === "stonebarb-cracked-tear")?.effects)
      .toMatchObject({ poiseDamageMultiplier: 1.3 });
    expect(tears.find(({ id }) => id === "speckled-hardtear")?.effects)
      .toMatchObject({ statusResistanceBonuses: { poison: 90 }, cleansesStatusBuildup: ["poison", "rot", "bleed", "frost", "sleep", "madness", "deathBlight"] });
    expect(tears.find(({ id }) => id === "crimson-crystal-tear-1")?.effects)
      .toMatchObject({ recovery: { instantMaxHpPercent: 0.5 } });
    expect(tears.find(({ id }) => id === "crimsonburst-crystal-tear")?.effects)
      .toMatchObject({ recovery: { hpPerSecond: 7, hpRegenerationDurationSeconds: 180 } });
    expect(tears.find(({ id }) => id === "thorny-cracked-tear"))
      .toMatchObject({ calculationStatus: "catalog-only", effects: null });
    expect(tears.filter(({ name }) => name === "Crimson Crystal Tear").map(({ id }) => id))
      .toEqual(["crimson-crystal-tear-1", "crimson-crystal-tear-2"]);
  });
});

const names = Array.from({ length: 32 }, (_, index) => index === 2 || index === 3 ? "Crimson Crystal Tear" : `Tear ${index}`);
names[4] = "Cerulean Crystal Tear";
names[5] = "Cerulean Crystal Tear";
names[13] = "Thorny Cracked Tear";
names[11] = "Opaline Hardtear";
names[6] = "Speckled Hardtear";
names[9] = "Crimsonburst Crystal Tear";
names[10] = "Greenburst Crystal Tear";
names[12] = "Winged Crystal Tear";
names[14] = "Spiked Cracked Tear";
names[21] = "Strength-knot Crystal Tear";
names[25] = "Cerulean Hidden Tear";
names[26] = "Stonebarb Cracked Tear";
names[29] = "Magic-Shrouding Cracked Tear";
const goods = names.map((Name, index) => ({ ID: 11000 + index, Name, iconId: 400 + index, goodsType: 10, refId_default: 3500 + index }));
const effects: ArmorEffectRow[] = names.map((_name, index) => ({
  ID: 3500 + index, effectEndurance: 180,
  addLifeForceStatus: 0, addWillpowerStatus: 0, addEndureStatus: 0,
  addStrengthStatus: index === 21 ? 10 : 0, addDexterityStatus: 0,
  addMagicStatus: 0, addFaithStatus: 0, addLuckStatus: 0,
  maxHpRate: 1, maxStaminaRate: 1,
  equipWeightChangeRate: index === 12 ? 4.5 : 1,
  staminaRecoverChangeSpeed: index === 10 ? 15 : 0,
  changeHpRate: index === 2 || index === 3 ? -50 : 0,
  changeMpRate: index === 4 || index === 5 ? -50 : 0,
  changeHpPoint: index === 9 ? -7 : 0,
  atkEnemyDmgCorrectRate_Physics: 1,
  atkEnemyDmgCorrectRate_Magic: index === 29 ? 1.2 : 1,
  atkEnemyDmgCorrectRate_Fire: 1, atkEnemyDmgCorrectRate_Thunder: 1,
  atkEnemyDmgCorrectRate_Dark: 1,
  physicsAttackRate: index === 14 ? 1.15 : 1,
  magicAttackRate: index === 14 ? 1.15 : 1,
  fireAttackRate: index === 14 ? 1.15 : 1,
  thunderAttackRate: index === 14 ? 1.15 : 1,
  darkAttackRate: index === 14 ? 1.15 : 1,
  defEnemyDmgCorrectRate_Physics: index === 11 ? 0.85 : 1,
  defEnemyDmgCorrectRate_Magic: index === 11 ? 0.85 : 1,
  defEnemyDmgCorrectRate_Fire: index === 11 ? 0.85 : 1,
  defEnemyDmgCorrectRate_Thunder: index === 11 ? 0.85 : 1,
  defEnemyDmgCorrectRate_Dark: index === 11 ? 0.85 : 1,
  artsConsumptionRate: index === 25 ? 0 : 1,
  magicConsumptionRate: index === 25 ? 0 : 1,
  miracleConsumptionRate: index === 25 ? 0 : 1,
  saAttackPowerRate: index === 26 ? 1.3 : 1,
} as ArmorEffectRow));
effects.push({
  ...effects[0]!, ID: 3604,
  changePoisonResistPoint: 90, changeDiseaseResistPoint: 90, changeBloodResistPoint: 90,
  changeFreezeResistPoint: 90, changeSleepResistPoint: 90, changeMadnessResistPoint: 90,
  changeCurseResistPoint: 90,
});
(["bloodAttackPower", "sleepAttackPower", "poizonAttackPower", "madnessAttackPower", "diseaseAttackPower", "freezeAttackPower", "curseAttackPower"] as const)
  .forEach((field, index) => effects.push({ ...effects[0]!, ID: 3612 + index, [field]: -99999 }));
