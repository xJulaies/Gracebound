import { describe, expect, it } from "vitest";
import type { ArmorEffectRow } from "../schemas/armor.schema";
import { mapRegulationGreatRunes } from "./mapRegulationGreatRunes";

describe("mapRegulationGreatRunes", () => {
  it("maps the complete catalog and only verified permanent effects", () => {
    const runes = mapRegulationGreatRunes(goods, effects);

    expect(runes).toHaveLength(7);
    expect(runes[0]).toMatchObject({
      id: "godricks-great-rune", activation: "rune-arc", calculationStatus: "supported",
      effects: {
        attributeBonuses: {
          vigor: 5, mind: 5, endurance: 5, strength: 5,
          dexterity: 5, intelligence: 5, faith: 5, arcane: 5,
        },
      },
    });
    expect(runes[1]?.effects?.resourceMultipliers).toEqual({ maxHp: 1.15, maxFp: 1.15, maxStamina: 1.15 });
    expect(runes[2]?.effects?.resourceMultipliers).toEqual({ maxHp: 1.25, maxFp: 1, maxStamina: 1 });
    expect(runes[3]).toMatchObject({ calculationStatus: "catalog-only", effects: null });
    expect(runes[6]).toMatchObject({ activation: "not-applicable", sourceEffectId: null });
  });

  it("rejects an incomplete source catalog", () => {
    expect(() => mapRegulationGreatRunes(goods.slice(1), effects)).toThrow("EquipParamGoods 191");
  });
});

const names = ["Godrick's", "Radahn's", "Morgott's", "Rykard's", "Mohg's", "Malenia's"];
const goods = [
  ...names.map((name, index) => ({ ID: 191 + index, Name: `${name} Great Rune`, iconId: 3201 + index, goodsType: 15 })),
  { ID: 10080, Name: "Great Rune of the Unborn", iconId: 3202, goodsType: 1 },
];
const effects = names.map((_name, index) => effect(600 + index * 10, index));

function effect(ID: number, index: number): ArmorEffectRow {
  const godrick = index === 0 ? 5 : 0;
  return {
    ID,
    addLifeForceStatus: godrick, addWillpowerStatus: godrick, addEndureStatus: godrick,
    addStrengthStatus: godrick, addDexterityStatus: godrick, addMagicStatus: godrick,
    addFaithStatus: godrick, addLuckStatus: godrick,
    maxHpRate: index === 1 ? 1.15 : index === 2 ? 1.25 : 1,
    maxMpRate: index === 1 ? 1.15 : 1,
    maxStaminaRate: index === 1 ? 1.15 : 1,
  } as ArmorEffectRow;
}
