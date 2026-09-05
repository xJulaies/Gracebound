import { describe, expect, it } from "vitest";
import { mapBaseGameTalismans } from "./mapRegulationTalismans";

describe("mapBaseGameTalismans", () => {
  it("maps named base-game rows and excludes DLC and unnamed rows", () => {
    const result = mapBaseGameTalismans([
      { ID: 6100, Name: "Entwining Umbilical Cord", refId: 361000, weight: 0.5, iconId: 19100 },
      { ID: 7000, Name: "Crimson Amber Medallion +3", refId: 20370000, weight: 0.6, iconId: 18700 },
      { ID: 7999, Name: "", refId: 0, weight: 0, iconId: 0 },
      { ID: 8040, Name: "Two-Handed Sword Talisman", refId: 20380400, weight: 1.2, iconId: 18919 },
    ]);

    expect(result).toEqual([
      {
        id: "entwining-umbilical-cord",
        sourceAccessoryId: 6100,
        name: "Entwining Umbilical Cord",
        iconId: 19100,
        weight: 0.5,
        sourceEffectId: 361000,
        calculationStatus: "catalog-only",
        effects: null,
      },
    ]);
  });

  it("maps verified permanent attribute bonuses", () => {
    const [talisman] = mapBaseGameTalismans(
      [{ ID: 1060, Name: "Starscourge Heirloom", refId: 310600, weight: 0.8, iconId: 18100 }],
      [{
        ID: 310600, Name: "[Talisman] Starscourge Heirloom",
        maxHpRate: 1, maxMpRate: 1, maxStaminaRate: 1, equipWeightChangeRate: 1,
        changePoisonResistPoint: 0, changeDiseaseResistPoint: 0,
        changeBloodResistPoint: 0, changeFreezeResistPoint: 0,
        changeSleepResistPoint: 0, changeMadnessResistPoint: 0,
        changeCurseResistPoint: 0,
        itemDropRate: 0, soulRate: 1, changeMagicSlot: 0,
        staminaRecoverChangeSpeed: 0, toughnessDamageCutRate: 1,
        artsConsumptionRate: 1,
        magicConsumptionRate: 1, extendLifeRate: 1,
        dexterityCancelSystemOnlyAddDexterity: 0,
        changeHpEstusFlaskCorrectRate: 1, changeMpEstusFlaskCorrectRate: 1,
        motionInterval: 0, changeHpPoint: 0,
        changeHpRate: 0, changeMpPoint: 0,
        staminaAttackRate: 1, guardStaminaMult: 1,
        conditionHp: -1, conditionHpRate: -1,
        bowDistRate: 0,
        accumuOverVal: -1, effectEndurance: -1,
        cycleOccurrenceSpEffectId: -1, invocationConditionsStateChange1: 0,
        fallDamageRate: 1, targetPriority: 0, hearingSearchEnemyRate: 1,
        stateInfo: 0, vfxId: -1,
        addLifeForceStatus: 0, addWillpowerStatus: 0, addEndureStatus: 0,
        addStrengthStatus: 5, addDexterityStatus: 0, addMagicStatus: 0,
        addFaithStatus: 0, addLuckStatus: 0,
        neutralDamageCutRate: 1, magicDamageCutRate: 1, fireDamageCutRate: 1,
        thunderDamageCutRate: 1, darkDamageCutRate: 1,
        defEnemyDmgCorrectRate_Physics: 1,
        defEnemyDmgCorrectRate_Magic: 1, defEnemyDmgCorrectRate_Fire: 1,
        defEnemyDmgCorrectRate_Thunder: 1, defEnemyDmgCorrectRate_Dark: 1,
        atkEnemyDmgCorrectRate_Physics: 1, atkEnemyDmgCorrectRate_Magic: 1,
        atkEnemyDmgCorrectRate_Fire: 1, atkEnemyDmgCorrectRate_Thunder: 1,
        atkEnemyDmgCorrectRate_Dark: 1,
        physicsAttackRate: 1, magicAttackRate: 1, fireAttackRate: 1,
        thunderAttackRate: 1, darkAttackRate: 1,
      }],
    );

    expect(talisman).toMatchObject({
      calculationStatus: "supported",
      effects: {
        attributeBonuses: {
          vigor: 0, mind: 0, endurance: 0, strength: 5, dexterity: 0,
          intelligence: 0, faith: 0, arcane: 0,
        },
        incomingDamageMultipliers: {
          physical: 1, magic: 1, fire: 1, lightning: 1, holy: 1,
        },
        outgoingDamageMultipliers: {
          physical: 1, magic: 1, fire: 1, lightning: 1, holy: 1,
        },
        skillDamageMultipliers: {
          physical: 1, magic: 1, fire: 1, lightning: 1, holy: 1,
        },
      },
    });
  });

  it("keeps seal attribute bonuses and incoming-damage penalties together", () => {
    const [talisman] = mapBaseGameTalismans(
      [{ ID: 1051, Name: "Radagon's Soreseal", refId: 310510, weight: 0.8, iconId: 18051 }],
      [{
        ID: 310510, Name: "[Talisman] Radagon's Soreseal",
        maxHpRate: 1, maxMpRate: 1, maxStaminaRate: 1, equipWeightChangeRate: 1,
        changePoisonResistPoint: 0, changeDiseaseResistPoint: 0,
        changeBloodResistPoint: 0, changeFreezeResistPoint: 0,
        changeSleepResistPoint: 0, changeMadnessResistPoint: 0,
        changeCurseResistPoint: 0,
        itemDropRate: 0, soulRate: 1, changeMagicSlot: 0,
        staminaRecoverChangeSpeed: 0, toughnessDamageCutRate: 1,
        artsConsumptionRate: 1,
        magicConsumptionRate: 1, extendLifeRate: 1,
        dexterityCancelSystemOnlyAddDexterity: 0,
        changeHpEstusFlaskCorrectRate: 1, changeMpEstusFlaskCorrectRate: 1,
        motionInterval: 0, changeHpPoint: 0,
        changeHpRate: 0, changeMpPoint: 0,
        staminaAttackRate: 1, guardStaminaMult: 1,
        conditionHp: -1, conditionHpRate: -1,
        bowDistRate: 0,
        accumuOverVal: -1, effectEndurance: -1,
        cycleOccurrenceSpEffectId: -1, invocationConditionsStateChange1: 0,
        fallDamageRate: 1, targetPriority: 0, hearingSearchEnemyRate: 1,
        stateInfo: 0, vfxId: -1,
        addLifeForceStatus: 5, addWillpowerStatus: 0, addEndureStatus: 5,
        addStrengthStatus: 5, addDexterityStatus: 5, addMagicStatus: 0,
        addFaithStatus: 0, addLuckStatus: 0,
        neutralDamageCutRate: 1.15, magicDamageCutRate: 1.15,
        fireDamageCutRate: 1.15, thunderDamageCutRate: 1.15,
        darkDamageCutRate: 1.15,
        defEnemyDmgCorrectRate_Physics: 1,
        defEnemyDmgCorrectRate_Magic: 1, defEnemyDmgCorrectRate_Fire: 1,
        defEnemyDmgCorrectRate_Thunder: 1, defEnemyDmgCorrectRate_Dark: 1,
        atkEnemyDmgCorrectRate_Physics: 1, atkEnemyDmgCorrectRate_Magic: 1,
        atkEnemyDmgCorrectRate_Fire: 1, atkEnemyDmgCorrectRate_Thunder: 1,
        atkEnemyDmgCorrectRate_Dark: 1,
        physicsAttackRate: 1, magicAttackRate: 1, fireAttackRate: 1,
        thunderAttackRate: 1, darkAttackRate: 1,
      }],
    );

    expect(talisman).toMatchObject({
      calculationStatus: "supported",
      effects: {
        attributeBonuses: {
          vigor: 5, endurance: 5, strength: 5, dexterity: 5,
        },
        incomingDamageMultipliers: {
          physical: 1.15, magic: 1.15, fire: 1.15, lightning: 1.15, holy: 1.15,
        },
      },
    });
  });

  it("maps PvE elemental damage and physical-defense Scorpion Charm modifiers", () => {
    const [talisman] = mapBaseGameTalismans(
      [{ ID: 2000, Name: "Magic Scorpion Charm", refId: 320000, weight: 0.8, iconId: 18230 }],
      [{
        ID: 320000, Name: "[Talisman] Magic Scorpion Charm",
        maxHpRate: 1, maxMpRate: 1, maxStaminaRate: 1, equipWeightChangeRate: 1,
        changePoisonResistPoint: 0, changeDiseaseResistPoint: 0,
        changeBloodResistPoint: 0, changeFreezeResistPoint: 0,
        changeSleepResistPoint: 0, changeMadnessResistPoint: 0,
        changeCurseResistPoint: 0,
        itemDropRate: 0, soulRate: 1, changeMagicSlot: 0,
        staminaRecoverChangeSpeed: 0, toughnessDamageCutRate: 1,
        artsConsumptionRate: 1,
        magicConsumptionRate: 1, extendLifeRate: 1,
        dexterityCancelSystemOnlyAddDexterity: 0,
        changeHpEstusFlaskCorrectRate: 1, changeMpEstusFlaskCorrectRate: 1,
        motionInterval: 0, changeHpPoint: 0,
        changeHpRate: 0, changeMpPoint: 0,
        staminaAttackRate: 1, guardStaminaMult: 1,
        conditionHp: -1, conditionHpRate: -1,
        bowDistRate: 0,
        accumuOverVal: -1, effectEndurance: -1,
        cycleOccurrenceSpEffectId: -1, invocationConditionsStateChange1: 0,
        fallDamageRate: 1, targetPriority: 0, hearingSearchEnemyRate: 1,
        stateInfo: 0, vfxId: -1,
        addLifeForceStatus: 0, addWillpowerStatus: 0, addEndureStatus: 0,
        addStrengthStatus: 0, addDexterityStatus: 0, addMagicStatus: 0,
        addFaithStatus: 0, addLuckStatus: 0,
        neutralDamageCutRate: 1, magicDamageCutRate: 1, fireDamageCutRate: 1,
        thunderDamageCutRate: 1, darkDamageCutRate: 1,
        defEnemyDmgCorrectRate_Physics: 1.1,
        defEnemyDmgCorrectRate_Magic: 1, defEnemyDmgCorrectRate_Fire: 1,
        defEnemyDmgCorrectRate_Thunder: 1, defEnemyDmgCorrectRate_Dark: 1,
        atkEnemyDmgCorrectRate_Physics: 1, atkEnemyDmgCorrectRate_Magic: 1.12,
        atkEnemyDmgCorrectRate_Fire: 1, atkEnemyDmgCorrectRate_Thunder: 1,
        atkEnemyDmgCorrectRate_Dark: 1,
        physicsAttackRate: 1, magicAttackRate: 1, fireAttackRate: 1,
        thunderAttackRate: 1, darkAttackRate: 1,
      }],
    );

    expect(talisman).toMatchObject({
      calculationStatus: "supported",
      effects: {
        incomingDamageMultipliers: { physical: 1.1 },
        outgoingDamageMultipliers: { magic: 1.12 },
      },
    });
  });

  it("maps Jar Shard multipliers into the skill-only scope", () => {
    const [talisman] = mapBaseGameTalismans(
      [{ ID: 1231, Name: "Shard of Alexander", refId: 312310, weight: 0.9, iconId: 18871 }],
      [{
        ID: 312310, Name: "[Talisman] Shard of Alexander",
        maxHpRate: 1, maxMpRate: 1, maxStaminaRate: 1, equipWeightChangeRate: 1,
        changePoisonResistPoint: 0, changeDiseaseResistPoint: 0,
        changeBloodResistPoint: 0, changeFreezeResistPoint: 0,
        changeSleepResistPoint: 0, changeMadnessResistPoint: 0,
        changeCurseResistPoint: 0,
        itemDropRate: 0, soulRate: 1, changeMagicSlot: 0,
        staminaRecoverChangeSpeed: 0, toughnessDamageCutRate: 1,
        artsConsumptionRate: 1,
        magicConsumptionRate: 1, extendLifeRate: 1,
        dexterityCancelSystemOnlyAddDexterity: 0,
        changeHpEstusFlaskCorrectRate: 1, changeMpEstusFlaskCorrectRate: 1,
        motionInterval: 0, changeHpPoint: 0,
        changeHpRate: 0, changeMpPoint: 0,
        staminaAttackRate: 1, guardStaminaMult: 1,
        conditionHp: -1, conditionHpRate: -1,
        bowDistRate: 0,
        accumuOverVal: -1, effectEndurance: -1,
        cycleOccurrenceSpEffectId: -1, invocationConditionsStateChange1: 0,
        fallDamageRate: 1, targetPriority: 0, hearingSearchEnemyRate: 1,
        stateInfo: 0, vfxId: -1,
        addLifeForceStatus: 0, addWillpowerStatus: 0, addEndureStatus: 0,
        addStrengthStatus: 0, addDexterityStatus: 0, addMagicStatus: 0,
        addFaithStatus: 0, addLuckStatus: 0,
        neutralDamageCutRate: 1, magicDamageCutRate: 1, fireDamageCutRate: 1,
        thunderDamageCutRate: 1, darkDamageCutRate: 1,
        defEnemyDmgCorrectRate_Physics: 1,
        defEnemyDmgCorrectRate_Magic: 1, defEnemyDmgCorrectRate_Fire: 1,
        defEnemyDmgCorrectRate_Thunder: 1, defEnemyDmgCorrectRate_Dark: 1,
        atkEnemyDmgCorrectRate_Physics: 1, atkEnemyDmgCorrectRate_Magic: 1,
        atkEnemyDmgCorrectRate_Fire: 1, atkEnemyDmgCorrectRate_Thunder: 1,
        atkEnemyDmgCorrectRate_Dark: 1,
        physicsAttackRate: 1.15, magicAttackRate: 1.15, fireAttackRate: 1.15,
        thunderAttackRate: 1.15, darkAttackRate: 1.15,
      }],
    );

    expect(talisman).toMatchObject({
      calculationStatus: "supported",
      effects: {
        outgoingDamageMultipliers: {
          physical: 1, magic: 1, fire: 1, lightning: 1, holy: 1,
        },
        skillDamageMultipliers: {
          physical: 1.15, magic: 1.15, fire: 1.15, lightning: 1.15, holy: 1.15,
        },
      },
    });
  });

  it("maps permanent PvE damage-negation talismans by damage type", () => {
    const talismans = mapBaseGameTalismans(
      [
        { ID: 4003, Name: "Dragoncrest Greatshield Talisman", refId: 340030, weight: 0.8, iconId: 18603 },
        { ID: 4052, Name: "Pearldrake Talisman +2", refId: 340520, weight: 0.9, iconId: 18652 },
      ],
      [
        damageNegationEffect(340030, "[Talisman] Dragoncrest Greatshield Talisman", {
          defEnemyDmgCorrectRate_Physics: 0.8,
        }),
        damageNegationEffect(340520, "[Talisman] Pearldrake Talisman +2", {
          defEnemyDmgCorrectRate_Magic: 0.91,
          defEnemyDmgCorrectRate_Fire: 0.91,
          defEnemyDmgCorrectRate_Thunder: 0.91,
          defEnemyDmgCorrectRate_Dark: 0.91,
        }),
      ],
    );

    expect(talismans).toMatchObject([
      {
        calculationStatus: "supported",
        effects: {
          incomingDamageMultipliers: {
            physical: 0.8, magic: 1, fire: 1, lightning: 1, holy: 1,
          },
        },
      },
      {
        calculationStatus: "supported",
        effects: {
          incomingDamageMultipliers: {
            physical: 1, magic: 0.91, fire: 0.91, lightning: 0.91, holy: 0.91,
          },
        },
      },
    ]);
  });

  it("maps permanent HP, FP, stamina, and equip-load multipliers", () => {
    const talismans = mapBaseGameTalismans(
      [
        { ID: 1002, Name: "Crimson Amber Medallion +2", refId: 310020, weight: 0.3, iconId: 18002 },
        { ID: 1032, Name: "Great-Jar's Arsenal", refId: 310320, weight: 1.5, iconId: 18032 },
        { ID: 1042, Name: "Erdtree's Favor +2", refId: 310420, weight: 1.5, iconId: 18042 },
      ],
      [
        { ...damageNegationEffect(310020, "Crimson +2", {}), maxHpRate: 1.08 },
        { ...damageNegationEffect(310320, "Great-Jar", {}), equipWeightChangeRate: 1.19 },
        {
          ...damageNegationEffect(310420, "Erdtree +2", {}),
          maxHpRate: 1.04,
          maxStaminaRate: 1.1,
          equipWeightChangeRate: 1.08,
        },
      ],
    );

    expect(talismans.map(({ effects }) => effects?.resourceMultipliers)).toEqual([
      { maxHp: 1.08, maxFp: 1, maxStamina: 1, maxEquipLoad: 1 },
      { maxHp: 1, maxFp: 1, maxStamina: 1, maxEquipLoad: 1.19 },
      { maxHp: 1.04, maxFp: 1, maxStamina: 1.1, maxEquipLoad: 1.08 },
    ]);
  });

  it("maps permanent status-resistance bonuses without merging status types", () => {
    const talismans = mapBaseGameTalismans(
      [
        { ID: 1171, Name: "Immunizing Horn Charm +1", refId: 311710, weight: 0.6, iconId: 18171 },
        { ID: 1201, Name: "Mottled Necklace +1", refId: 312010, weight: 0.9, iconId: 18201 },
      ],
      [
        {
          ...damageNegationEffect(311710, "Immunizing +1", {}),
          changePoisonResistPoint: 140,
          changeDiseaseResistPoint: 140,
        },
        {
          ...damageNegationEffect(312010, "Mottled +1", {}),
          changePoisonResistPoint: 60,
          changeDiseaseResistPoint: 60,
          changeBloodResistPoint: 60,
          changeFreezeResistPoint: 60,
          changeSleepResistPoint: 60,
          changeMadnessResistPoint: 60,
        },
      ],
    );

    expect(talismans.map(({ effects }) => effects?.statusResistanceBonuses)).toEqual([
      { poison: 140, rot: 140, bleed: 0, frost: 0, sleep: 0, madness: 0, deathBlight: 0 },
      { poison: 60, rot: 60, bleed: 60, frost: 60, sleep: 60, madness: 60, deathBlight: 0 },
    ]);
  });

  it("keeps sorcery and incantation damage scopes separate", () => {
    const talismans = mapBaseGameTalismans(
      [
        { ID: 3001, Name: "Graven-Mass Talisman", refId: 330010, weight: 1, iconId: 18501 },
        { ID: 3050, Name: "Flock's Canvas Talisman", refId: 330500, weight: 1, iconId: 18550 },
      ],
      [
        { ...damageNegationEffect(330010, "Graven-Mass", {}), magicAttackRate: 1.08 },
        { ...damageNegationEffect(330500, "Flock's Canvas", {}), magicAttackRate: 1.08 },
      ],
    );

    expect(talismans.map(({ effects }) => effects?.spellDamageMultipliers)).toEqual([
      { sorcery: 1.08, incantation: 1 },
      { sorcery: 1, incantation: 1.08 },
    ]);
  });

  it("maps permanent utility effects from their dedicated Regulation fields", () => {
    const definitions = [
      { ID: 1100, Name: "Silver Scarab", refId: 311000, itemDropRate: 0.75 },
      { ID: 1110, Name: "Gold Scarab", refId: 311100, soulRate: 1.2 },
      { ID: 1140, Name: "Moon of Nokstella", refId: 311400, changeMagicSlot: 2 },
      { ID: 1150, Name: "Green Turtle Talisman", refId: 311500, staminaRecoverChangeSpeed: 8 },
      { ID: 1210, Name: "Bull-Goat's Talisman", refId: 312100, toughnessDamageCutRate: 0.75 },
      { ID: 6020, Name: "Carian Filigreed Crest", refId: 360200, artsConsumptionRate: 0.75 },
    ];
    const talismans = mapBaseGameTalismans(
      definitions.map(({ ID, Name, refId }) => ({ ID, Name, refId, weight: 1, iconId: ID })),
      definitions.map(({ refId, Name, ID: _ID, ...effect }) => ({
        ...damageNegationEffect(refId, Name, {}),
        ...effect,
      })),
    );

    expect(talismans.map(({ effects }) => effects?.utilityEffects)).toEqual([
      { ...neutralUtilityEffects(), itemDiscoveryRateBonus: 0.75 },
      { ...neutralUtilityEffects(), runeAcquisitionMultiplier: 1.2 },
      { ...neutralUtilityEffects(), memorySlotBonus: 2 },
      { ...neutralUtilityEffects(), staminaRecoverySpeedBonus: 8 },
      { ...neutralUtilityEffects(), poiseDamageMultiplier: 0.75 },
      { ...neutralUtilityEffects(), skillFpCostMultiplier: 0.75 },
    ]);
  });

  it("maps permanent spell utility effects and Primal Glintstone's HP tradeoff", () => {
    const definitions = [
      { ID: 3060, Name: "Old Lord's Talisman", refId: 330600, extendLifeRate: 1.3 },
      {
        ID: 3070, Name: "Radagon Icon", refId: 330700,
        dexterityCancelSystemOnlyAddDexterity: 30,
      },
      {
        ID: 3080, Name: "Primal Glintstone Blade", refId: 330800,
        maxHpRate: 0.85, magicConsumptionRate: 0.75,
      },
    ];
    const talismans = mapBaseGameTalismans(
      definitions.map(({ ID, Name, refId }) => ({ ID, Name, refId, weight: 1, iconId: ID })),
      definitions.map(({ refId, Name, ID: _ID, ...effect }) => ({
        ...damageNegationEffect(refId, Name, {}),
        ...effect,
      })),
    );

    expect(talismans.map(({ effects }) => effects?.utilityEffects)).toEqual([
      { ...neutralUtilityEffects(), spellEffectDurationMultiplier: 1.3 },
      { ...neutralUtilityEffects(), castingSpeedVirtualDexterity: 30 },
      { ...neutralUtilityEffects(), spellFpCostMultiplier: 0.75 },
    ]);
    expect(talismans[2]?.effects?.resourceMultipliers.maxHp).toBe(0.85);
  });

  it("maps flask recovery and periodic HP regeneration", () => {
    const definitions = [
      {
        ID: 5000, Name: "Crimson Seed Talisman", refId: 350000,
        changeHpEstusFlaskCorrectRate: 1.2,
      },
      {
        ID: 5010, Name: "Cerulean Seed Talisman", refId: 350100,
        changeMpEstusFlaskCorrectRate: 1.2,
      },
      {
        ID: 5020, Name: "Blessed Dew Talisman", refId: 350200,
        motionInterval: 1, changeHpPoint: -2,
      },
    ];
    const talismans = mapBaseGameTalismans(
      definitions.map(({ ID, Name, refId }) => ({ ID, Name, refId, weight: 1, iconId: ID })),
      definitions.map(({ refId, Name, ID: _ID, ...effect }) => ({
        ...damageNegationEffect(refId, Name, {}),
        ...effect,
      })),
    );

    expect(talismans.map(({ effects }) => effects?.recoveryEffects)).toEqual([
      { hpFlaskRecoveryMultiplier: 1.2, fpFlaskRecoveryMultiplier: 1, hpRecoveryPerSecond: 0 },
      { hpFlaskRecoveryMultiplier: 1, fpFlaskRecoveryMultiplier: 1.2, hpRecoveryPerSecond: 0 },
      { hpFlaskRecoveryMultiplier: 1, fpFlaskRecoveryMultiplier: 1, hpRecoveryPerSecond: 2 },
    ]);
  });

  it("keeps guard modifiers and unconditional incoming damage separate", () => {
    const talismans = mapBaseGameTalismans(
      [
        { ID: 2070, Name: "Hammer Talisman", refId: 320700, weight: 0.9, iconId: 18270 },
        { ID: 4100, Name: "Greatshield Talisman", refId: 341000, weight: 0.9, iconId: 18660 },
        { ID: 6060, Name: "Daedicar's Woe", refId: 360600, weight: 0.8, iconId: 19060 },
      ],
      [
        { ...damageNegationEffect(320700, "Hammer", {}), staminaAttackRate: 1.4 },
        { ...damageNegationEffect(341000, "Greatshield", {}), guardStaminaMult: 0.8 },
        {
          ...damageNegationEffect(360600, "Daedicar", {}),
          neutralDamageCutRate: 2,
          magicDamageCutRate: 2,
          fireDamageCutRate: 2,
          thunderDamageCutRate: 2,
          darkDamageCutRate: 2,
        },
      ],
    );

    expect(talismans[0]?.effects?.guardEffects).toEqual({
      staminaDamageMultiplier: 1.4,
      staminaCostMultiplier: 1,
    });
    expect(talismans[1]?.effects?.guardEffects).toEqual({
      staminaDamageMultiplier: 1,
      staminaCostMultiplier: 0.8,
    });
    expect(talismans[2]?.effects?.incomingDamageMultipliers).toEqual({
      physical: 2, magic: 2, fire: 2, lightning: 2, holy: 2,
    });
  });

  it("maps attack-condition talismans into isolated server-owned scopes", () => {
    const rows = [
      { ID: 2060, Name: "Spear Talisman", refId: 320600 },
      { ID: 2090, Name: "Dagger Talisman", refId: 320900 },
      { ID: 2120, Name: "Twinblade Talisman", refId: 321200 },
      { ID: 2140, Name: "Lance Talisman", refId: 321400 },
      { ID: 2180, Name: "Claw Talisman", refId: 321800 },
      { ID: 2200, Name: "Curved Sword Talisman", refId: 322000 },
    ];
    const talismans = mapBaseGameTalismans(
      rows.map((row) => ({ ...row, weight: 1, iconId: row.ID })),
      [
        { ...damageNegationEffect(320600, "Spear", {}), physicsAttackRate: 1.15 },
        {
          ...damageNegationEffect(320900, "Dagger", {}),
          physicsAttackRate: 1.17, magicAttackRate: 1.17, fireAttackRate: 1.17,
          thunderAttackRate: 1.17, darkAttackRate: 1.17,
        },
        {
          ...damageNegationEffect(321200, "Twinblade", {}),
          atkEnemyDmgCorrectRate_Physics: 1.45, atkEnemyDmgCorrectRate_Magic: 1.45,
          atkEnemyDmgCorrectRate_Fire: 1.45, atkEnemyDmgCorrectRate_Thunder: 1.45,
          atkEnemyDmgCorrectRate_Dark: 1.45,
        },
        {
          ...damageNegationEffect(321400, "Lance", {}),
          physicsAttackRate: 1.15, magicAttackRate: 1.15, fireAttackRate: 1.15,
          thunderAttackRate: 1.15, darkAttackRate: 1.15,
        },
        {
          ...damageNegationEffect(321800, "Claw", {}),
          atkEnemyDmgCorrectRate_Physics: 1.15, atkEnemyDmgCorrectRate_Magic: 1.15,
          atkEnemyDmgCorrectRate_Fire: 1.15, atkEnemyDmgCorrectRate_Thunder: 1.15,
          atkEnemyDmgCorrectRate_Dark: 1.15,
        },
        {
          ...damageNegationEffect(322000, "Curved Sword", {}),
          physicsAttackRate: 1.2, magicAttackRate: 1.2, fireAttackRate: 1.2,
          thunderAttackRate: 1.2, darkAttackRate: 1.2,
        },
      ],
    );
    const scopes = talismans.map(({ effects }) => effects?.conditionalAttackDamageMultipliers);

    expect(scopes[0]?.counterattack).toEqual({ ...neutralDamageTypes(), physical: 1.15 });
    expect(scopes[1]?.critical).toEqual(allDamageTypes(1.17));
    expect(scopes[2]?.finalChainAttack).toEqual(allDamageTypes(1.45));
    expect(scopes[3]?.mounted).toEqual(allDamageTypes(1.15));
    expect(scopes[4]?.jumping).toEqual(allDamageTypes(1.15));
    expect(scopes[5]?.guardCounter).toEqual(allDamageTypes(1.2));
    expect(talismans[4]?.effects?.outgoingDamageMultipliers).toEqual(
      neutralDamageTypes(),
    );
  });

  it("maps HP thresholds together with their outgoing or incoming modifiers", () => {
    const rows = [
      { ID: 2040, Name: "Red-Feathered Branchsword", refId: 320400 },
      { ID: 2050, Name: "Ritual Sword Talisman", refId: 320500 },
      { ID: 4080, Name: "Blue-Feathered Branchsword", refId: 340800 },
      { ID: 4090, Name: "Ritual Shield Talisman", refId: 340900 },
    ];
    const red = { ...damageNegationEffect(320400, "Red", {}), conditionHp: 20 };
    const ritualSword = {
      ...damageNegationEffect(320500, "Ritual Sword", {}), conditionHpRate: 100,
    };
    const blue = { ...damageNegationEffect(340800, "Blue", {}), conditionHp: 20 };
    const ritualShield = {
      ...damageNegationEffect(340900, "Ritual Shield", {}), conditionHpRate: 100,
    };
    Object.assign(red, enemyDamageFields(1.2));
    Object.assign(ritualSword, enemyDamageFields(1.1));
    Object.assign(blue, defensiveDamageFields(0.5));
    Object.assign(ritualShield, defensiveDamageFields(0.7));

    const talismans = mapBaseGameTalismans(
      rows.map((row) => ({ ...row, weight: 1, iconId: row.ID })),
      [red, ritualSword, blue, ritualShield],
    );
    const effects = talismans.map(({ effects: value }) => value?.hpConditionedDamageEffect);

    expect(effects[0]).toEqual({
      activation: "low-hp", thresholdPercent: 20,
      outgoingDamageMultipliers: allDamageTypes(1.2),
      incomingDamageMultipliers: allDamageTypes(1),
    });
    expect(effects[1]).toMatchObject({
      activation: "full-hp", thresholdPercent: 100,
      outgoingDamageMultipliers: allDamageTypes(1.1),
    });
    expect(effects[2]).toMatchObject({
      activation: "low-hp", thresholdPercent: 20,
      incomingDamageMultipliers: allDamageTypes(0.5),
    });
    expect(effects[3]).toMatchObject({
      activation: "full-hp", thresholdPercent: 100,
      incomingDamageMultipliers: allDamageTypes(0.7),
    });
  });

  it("keeps ranged, roar, and charged spell/skill effects in separate scopes", () => {
    const rows = [
      { ID: 2100, Name: "Arrow's Reach Talisman", refId: 321000 },
      { ID: 2150, Name: "Arrow's Sting Talisman", refId: 321500 },
      { ID: 2190, Name: "Roar Medallion", refId: 321900 },
      { ID: 2210, Name: "Companion Jar", refId: 322100 },
      { ID: 2220, Name: "Perfumer's Talisman", refId: 322200 },
      { ID: 3090, Name: "Godfrey Icon", refId: 330900 },
    ];
    const talismans = mapBaseGameTalismans(
      rows.map((row) => ({ ...row, weight: 1, iconId: row.ID })),
      [
        { ...damageNegationEffect(321000, "Reach", {}), bowDistRate: 65 },
        { ...damageNegationEffect(321500, "Sting", {}), ...attackRateFields(1.1) },
        { ...damageNegationEffect(321900, "Roar", {}), ...attackRateFields(1.15) },
        { ...damageNegationEffect(322100, "Companion Jar", {}), ...attackRateFields(1.2) },
        { ...damageNegationEffect(322200, "Perfumer", {}), ...attackRateFields(1.2) },
        { ...damageNegationEffect(330900, "Godfrey", {}), ...attackRateFields(1.15) },
      ],
    );
    const effects = talismans.map(({ effects: value }) => value?.specializedAttackEffects);

    expect(effects[0]?.projectileRangeBonus).toBe(65);
    expect(effects[1]?.rangedDamageMultipliers).toEqual(allDamageTypes(1.1));
    expect(effects[2]?.roarAndBreathDamageMultipliers).toEqual(allDamageTypes(1.15));
    expect(effects[3]?.throwablePotDamageMultipliers).toEqual(allDamageTypes(1.2));
    expect(effects[4]?.perfumeDamageMultipliers).toEqual(allDamageTypes(1.2));
    expect(effects[5]?.chargedSpellAndSkillDamageMultipliers).toEqual(allDamageTypes(1.15));
  });

  it("maps successive-attack thresholds, durations, multipliers, and Millicent's Dexterity", () => {
    const effects = [
      { ...damageNegationEffect(312500, "Millicent", {}), addDexterityStatus: 5 },
      successiveTrigger(312501, 17), successiveTrigger(312502, 30),
      successiveTrigger(312503, 45), successiveTrigger(312504, 60),
      successiveBoost(312505, 1.04, 1.5), successiveBoost(312506, 1.06, 1.5),
      successiveBoost(312507, 1.11, 1.5), successiveBoost(312508, 1.11, 0),
      damageNegationEffect(320800, "Winged", {}),
      successiveTrigger(320801, 30), successiveTrigger(320802, 45),
      successiveTrigger(320803, 60),
      successiveBoost(320804, 1.03, 1.5), successiveBoost(320805, 1.05, 1.5),
      successiveBoost(320806, 1.1, 1.5),
    ];
    const talismans = mapBaseGameTalismans(
      [
        { ID: 1250, Name: "Millicent's Prosthesis", refId: 312500, weight: 1.6, iconId: 18250 },
        { ID: 2080, Name: "Winged Sword Insignia", refId: 320800, weight: 1.4, iconId: 18280 },
      ],
      effects,
    );

    expect(talismans[0]?.effects?.attributeBonuses.dexterity).toBe(5);
    expect(talismans[0]?.effects?.successiveAttackEffect.stages).toEqual([
      stage(17, 1.5, 1.04), stage(30, 1.5, 1.06),
      stage(45, 1.5, 1.11), stage(60, 0, 1.11),
    ]);
    expect(talismans[1]?.effects?.successiveAttackEffect.stages).toEqual([
      stage(30, 1.5, 1.03), stage(45, 1.5, 1.05), stage(60, 1.5, 1.1),
    ]);
  });

  it("maps nearby status triggers through their linked timed damage boosts", () => {
    const talismans = mapBaseGameTalismans(
      [
        { ID: 2160, Name: "Lord of Blood's Exultation", refId: 321600, weight: 0.9, iconId: 18310 },
        { ID: 2170, Name: "Kindred of Rot's Exultation", refId: 321700, weight: 0.9, iconId: 18320 },
      ],
      [
        {
          ...damageNegationEffect(321600, "Lord of Blood", {}),
          cycleOccurrenceSpEffectId: 321601,
          invocationConditionsStateChange1: 379,
        },
        {
          ...damageNegationEffect(321601, "Lord of Blood boost", {}),
          ...enemyDamageFields(1.2), effectEndurance: 20,
        },
        {
          ...damageNegationEffect(321700, "Kindred of Rot", {}),
          cycleOccurrenceSpEffectId: 321701,
          invocationConditionsStateChange1: 380,
        },
        {
          ...damageNegationEffect(321701, "Kindred of Rot boost", {}),
          ...enemyDamageFields(1.2), effectEndurance: 20,
        },
      ],
    );

    expect(talismans.map(({ effects }) => effects?.triggeredDamageEffect)).toEqual([
      { trigger: "blood-loss-nearby", durationSeconds: 20, damageMultipliers: allDamageTypes(1.2) },
      { trigger: "poison-or-rot-nearby", durationSeconds: 20, damageMultipliers: allDamageTypes(1.2) },
    ]);
  });

  it("maps event recovery triggers with percent and flat components", () => {
    const rows = [
      { ID: 5030, Name: "Taker's Cameo", refId: 350300 },
      { ID: 5040, Name: "Godskin Swaddling Cloth", refId: 350400 },
      { ID: 5050, Name: "Assassin's Crimson Dagger", refId: 350500 },
      { ID: 5060, Name: "Assassin's Cerulean Dagger", refId: 350600 },
      { ID: 6110, Name: "Ancestral Spirit's Horn", refId: 361100 },
    ];
    const mainEffects = rows.map(({ refId, Name }) =>
      damageNegationEffect(refId, Name, {}));
    mainEffects[1]!.accumuOverVal = 32;
    const recoveryEffect = (ID: number, hpRate = 0, hpPoint = 0, mpPoint = 0) => ({
      ...damageNegationEffect(ID, "Recovery", {}),
      changeHpRate: hpRate,
      changeHpPoint: hpPoint,
      changeMpPoint: mpPoint,
    });
    const talismans = mapBaseGameTalismans(
      rows.map((row) => ({ ...row, weight: 1, iconId: row.ID })),
      [
        ...mainEffects,
        recoveryEffect(350301, -3, -30),
        recoveryEffect(350401, -3, -30),
        recoveryEffect(350502, -10, -85),
        recoveryEffect(350602, 0, 0, -15),
        recoveryEffect(361101, 0, 0, -3),
      ],
    );

    expect(talismans.map(({ effects }) => effects?.eventRecoveryEffect)).toEqual([
      recovery("enemy-kill", null, 3, 30, 0),
      recovery("successive-attacks", 32, 3, 30, 0),
      recovery("critical-hit", null, 10, 85, 0),
      recovery("critical-hit", null, 0, 0, 15),
      recovery("enemy-kill", null, 0, 0, 3),
    ]);
  });

  it("maps verified miscellaneous utility and appearance effects", () => {
    const rows = [
      { ID: 6000, Name: "Crepus's Vial", refId: 360000 },
      { ID: 6040, Name: "Longtail Cat Talisman", refId: 360400 },
      { ID: 6050, Name: "Shabriri's Woe", refId: 360500 },
      { ID: 6070, Name: "Sacrificial Twig", refId: 360700 },
      { ID: 6080, Name: "Furled Finger's Trick-Mirror", refId: 360800 },
      { ID: 6090, Name: "Host's Trick-Mirror", refId: 360900 },
    ];
    const effects = rows.map(({ refId, Name }) => damageNegationEffect(refId, Name, {}));
    Object.assign(effects[0]!, { hearingSearchEnemyRate: 0, stateInfo: 54 });
    effects[1]!.fallDamageRate = 0;
    effects[2]!.targetPriority = 0.1;
    effects[3]!.stateInfo = 159;
    effects[4]!.vfxId = 360800;
    effects[5]!.vfxId = 360900;

    const talismans = mapBaseGameTalismans(
      rows.map((row) => ({ ...row, weight: 1, iconId: row.ID })),
      effects,
    );

    expect(talismans.map(({ effects: value }) => value?.miscellaneousEffects)).toEqual([
      { ...neutralMiscellaneousEffects(), silentMovement: true },
      { ...neutralMiscellaneousEffects(), fallDamageMultiplier: 0 },
      { ...neutralMiscellaneousEffects(), enemyTargetPriorityModifier: 0.1 },
      { ...neutralMiscellaneousEffects(), preventsRuneLoss: true },
      { ...neutralMiscellaneousEffects(), appearance: "host" },
      { ...neutralMiscellaneousEffects(), appearance: "cooperator" },
    ]);
  });

  it("maps Crucible and crouched-concealment defense mechanics", () => {
    const scale = { ...damageNegationEffect(340600, "Scale", {}), stateInfo: 335 };
    Object.assign(scale, damageCutFields(0.7));
    const feather = {
      ...damageNegationEffect(340700, "Feather", {}),
      stateInfo: 290, motionInterval: 0.06, cycleOccurrenceSpEffectId: 340701,
    };
    Object.assign(feather, damageCutFields(1.3));
    const knot = { ...damageNegationEffect(341100, "Knot", {}), stateInfo: 450 };
    const veil = {
      ...damageNegationEffect(360100, "Veil", {}),
      invocationConditionsStateChange1: 466, vfxId: 360100,
    };
    const talismans = mapBaseGameTalismans(
      [
        { ID: 4060, Name: "Crucible Scale Talisman", refId: 340600, weight: 1.1, iconId: 18660 },
        { ID: 4070, Name: "Crucible Feather Talisman", refId: 340700, weight: 0.8, iconId: 18670 },
        { ID: 4110, Name: "Crucible Knot Talisman", refId: 341100, weight: 0.5, iconId: 18710 },
        { ID: 6010, Name: "Concealing Veil", refId: 360100, weight: 0.9, iconId: 19010 },
      ],
      [
        scale, feather,
        { ...damageNegationEffect(340701, "Feather cycle", {}), effectEndurance: 0.1 },
        knot, veil,
      ],
    );

    expect(talismans[0]?.effects?.specialDefenseEffects.criticalDamageMultipliers)
      .toEqual(allDamageTypes(0.7));
    expect(talismans[1]?.effects).toMatchObject({
      incomingDamageMultipliers: allDamageTypes(1.3),
      specialDefenseEffects: {
        dodgeEffectRefreshSeconds: 0.06,
        dodgeEffectDurationSeconds: 0.1,
      },
    });
    expect(talismans[2]?.effects?.specialDefenseEffects.reducesHeadshotImpact).toBe(true);
    expect(talismans[3]?.effects?.specialDefenseEffects.concealsAtDistanceWhileCrouching)
      .toBe(true);
  });
});

function damageCutFields(value: number) {
  return {
    neutralDamageCutRate: value, magicDamageCutRate: value,
    fireDamageCutRate: value, thunderDamageCutRate: value, darkDamageCutRate: value,
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

function recovery(
  trigger: "enemy-kill" | "critical-hit" | "successive-attacks",
  accumulatorThreshold: number | null,
  maxHpRecoveryPercent: number,
  flatHpRecovery: number,
  flatFpRecovery: number,
) {
  return { trigger, accumulatorThreshold, maxHpRecoveryPercent, flatHpRecovery, flatFpRecovery };
}

function successiveTrigger(ID: number, accumuOverVal: number) {
  return { ...damageNegationEffect(ID, "Trigger", {}), accumuOverVal };
}

function successiveBoost(ID: number, multiplier: number, effectEndurance: number) {
  return {
    ...damageNegationEffect(ID, "Boost", {}),
    ...enemyDamageFields(multiplier),
    effectEndurance,
  };
}

function stage(accumulatorThreshold: number, durationSeconds: number, multiplier: number) {
  return {
    accumulatorThreshold,
    durationSeconds,
    damageMultipliers: allDamageTypes(multiplier),
  };
}

function attackRateFields(value: number) {
  return {
    physicsAttackRate: value, magicAttackRate: value, fireAttackRate: value,
    thunderAttackRate: value, darkAttackRate: value,
  };
}

function enemyDamageFields(value: number) {
  return {
    atkEnemyDmgCorrectRate_Physics: value, atkEnemyDmgCorrectRate_Magic: value,
    atkEnemyDmgCorrectRate_Fire: value, atkEnemyDmgCorrectRate_Thunder: value,
    atkEnemyDmgCorrectRate_Dark: value,
  };
}

function defensiveDamageFields(value: number) {
  return {
    defEnemyDmgCorrectRate_Physics: value, defEnemyDmgCorrectRate_Magic: value,
    defEnemyDmgCorrectRate_Fire: value, defEnemyDmgCorrectRate_Thunder: value,
    defEnemyDmgCorrectRate_Dark: value,
  };
}

function allDamageTypes(value: number) {
  return { physical: value, magic: value, fire: value, lightning: value, holy: value };
}

function neutralDamageTypes() {
  return allDamageTypes(1);
}

function neutralUtilityEffects() {
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

function damageNegationEffect(
  ID: number,
  Name: string,
  multipliers: Partial<{
    defEnemyDmgCorrectRate_Physics: number;
    defEnemyDmgCorrectRate_Magic: number;
    defEnemyDmgCorrectRate_Fire: number;
    defEnemyDmgCorrectRate_Thunder: number;
    defEnemyDmgCorrectRate_Dark: number;
  }>,
) {
  return {
    ID, Name,
    maxHpRate: 1, maxMpRate: 1, maxStaminaRate: 1, equipWeightChangeRate: 1,
    changePoisonResistPoint: 0, changeDiseaseResistPoint: 0,
    changeBloodResistPoint: 0, changeFreezeResistPoint: 0,
    changeSleepResistPoint: 0, changeMadnessResistPoint: 0,
    changeCurseResistPoint: 0,
    itemDropRate: 0, soulRate: 1, changeMagicSlot: 0,
    staminaRecoverChangeSpeed: 0, toughnessDamageCutRate: 1,
    artsConsumptionRate: 1,
    magicConsumptionRate: 1, extendLifeRate: 1,
    dexterityCancelSystemOnlyAddDexterity: 0,
    changeHpEstusFlaskCorrectRate: 1, changeMpEstusFlaskCorrectRate: 1,
    motionInterval: 0, changeHpPoint: 0,
    changeHpRate: 0, changeMpPoint: 0,
    staminaAttackRate: 1, guardStaminaMult: 1,
    conditionHp: -1, conditionHpRate: -1,
    bowDistRate: 0,
    accumuOverVal: -1, effectEndurance: -1,
    cycleOccurrenceSpEffectId: -1, invocationConditionsStateChange1: 0,
    fallDamageRate: 1, targetPriority: 0, hearingSearchEnemyRate: 1,
    stateInfo: 0, vfxId: -1,
    addLifeForceStatus: 0, addWillpowerStatus: 0, addEndureStatus: 0,
    addStrengthStatus: 0, addDexterityStatus: 0, addMagicStatus: 0,
    addFaithStatus: 0, addLuckStatus: 0,
    neutralDamageCutRate: 1, magicDamageCutRate: 1, fireDamageCutRate: 1,
    thunderDamageCutRate: 1, darkDamageCutRate: 1,
    defEnemyDmgCorrectRate_Physics: 1,
    defEnemyDmgCorrectRate_Magic: 1,
    defEnemyDmgCorrectRate_Fire: 1,
    defEnemyDmgCorrectRate_Thunder: 1,
    defEnemyDmgCorrectRate_Dark: 1,
    atkEnemyDmgCorrectRate_Physics: 1, atkEnemyDmgCorrectRate_Magic: 1,
    atkEnemyDmgCorrectRate_Fire: 1, atkEnemyDmgCorrectRate_Thunder: 1,
    atkEnemyDmgCorrectRate_Dark: 1,
    physicsAttackRate: 1, magicAttackRate: 1, fireAttackRate: 1,
    thunderAttackRate: 1, darkAttackRate: 1,
    ...multipliers,
  };
}
