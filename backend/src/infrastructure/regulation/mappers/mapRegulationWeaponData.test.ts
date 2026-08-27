import { describe, expect, it } from "vitest";
import { calculateAttackRating } from "../../../features/weapons/domain/calculateAttackRating";
import type {
  AttackElementCorrectRow,
  CalcCorrectGraphRow,
  ReinforceWeaponRow,
  WeaponParamRow,
} from "../schemas/weaponParam.schema";
import { mapRegulationWeapon, mapScalingCurve } from "./mapRegulationWeaponData";

describe("mapScalingCurve", () => {
  it("reconstructs ERDB's non-linear default correction graph", () => {
    const curve = mapScalingCurve(graph(0, [1, 18, 60, 80, 150], [0, 25, 75, 90, 110], [1.2, -1.2, 1, 1, 1]));

    expect(curve.values).toHaveLength(151);
    expect(curve.values[12]).toBeCloseTo(0.148277, 5);
  });
});

describe("mapRegulationWeapon", () => {
  it("matches the established Moonveil +10 ERDB attack rating", () => {
    const dataSet = mapRegulationWeapon(9060000, "1.16.1", moonveilTables());
    const weapon = dataSet.weapons.moonveil;

    expect(weapon?.baseScaling).toEqual({ strength: 0.12, dexterity: 0.5, intelligence: 0.6, faith: 0, arcane: 0 });
    expect(calculateAttackRating(weapon!, 10, { strength: 12, dexterity: 30, intelligence: 70, faith: 8, arcane: 8 }, dataSet)).toEqual({
      physical: 251,
      magic: 420,
      fire: 0,
      lightning: 0,
      holy: 0,
    });
  });
});

function moonveilTables() {
  const weapon = {
    ID: 9060000, Name: "Moonveil", attackBasePhysics: 73, attackBaseMagic: 87, attackBaseFire: 0, attackBaseThunder: 0, attackBaseDark: 0,
    correctStrength: 12, correctAgility: 50, correctMagic: 60, correctFaith: 0, correctLuck: 0,
    properStrength: 12, properAgility: 18, properMagic: 23, properFaith: 0, properLuck: 0,
    reinforceTypeId: 2200, attackElementCorrectId: 10000, correctType_Physics: 0, correctType_Magic: 4, correctType_Fire: 0, correctType_Thunder: 0, correctType_Dark: 0, atkAttribute: 0, atkAttribute2: 2,
  } satisfies WeaponParamRow;
  const reinforcements = Array.from({ length: 11 }, (_, level) => ({
    ID: 2200 + level, Name: `Unique +${level}`, physicsAtkRate: 1 + 0.145 * level, magicAtkRate: 1 + 0.145 * level, fireAtkRate: 1 + 0.145 * level, thunderAtkRate: 1 + 0.145 * level, darkAtkRate: 1 + 0.145 * level,
    correctStrengthRate: 1 + 0.08 * level, correctAgilityRate: 1 + 0.08 * level, correctMagicRate: 1 + 0.08 * level, correctFaithRate: 1 + 0.08 * level, correctLuckRate: 1 + 0.08 * level,
  })) satisfies ReinforceWeaponRow[];
  const correction: AttackElementCorrectRow = { ID: 10000, Name: "Moonveil correction" };
  for (const damage of ["Physics", "Magic", "Fire", "Thunder", "Dark"]) for (const attribute of ["Strength", "Dexterity", "Magic", "Faith", "Luck"]) {
    correction[`is${attribute}Correct_by${damage}`] = Number((damage === "Physics" && ["Strength", "Dexterity"].includes(attribute)) || (damage === "Magic" && attribute === "Magic") || (damage === "Fire" && attribute === "Faith") || (damage === "Thunder" && attribute === "Dexterity") || (damage === "Dark" && attribute === "Faith"));
    correction[`overwrite${attribute}CorrectRate_by${damage}`] = -1;
    correction[`Influence${attribute}CorrectRate_by${damage}`] = 100;
  }
  return { weapons: [weapon], reinforcements, corrections: [correction], graphs: [graph(0, [1, 18, 60, 80, 150], [0, 25, 75, 90, 110], [1.2, -1.2, 1, 1, 1]), graph(4, [1, 20, 50, 80, 99], [0, 40, 80, 95, 100], [1, 1, 1, 1, 1])] };
}

function graph(id: number, stages: number[], growth: number[], adjustment: number[]): CalcCorrectGraphRow {
  const row: CalcCorrectGraphRow = { ID: id, Name: `Graph ${id}` };
  for (let index = 0; index < 5; index += 1) {
    row[`stageMaxVal${index}`] = stages[index]!;
    row[`stageMaxGrowVal${index}`] = growth[index]!;
    row[`adjPt_maxGrowVal${index}`] = adjustment[index]!;
  }
  return row;
}
