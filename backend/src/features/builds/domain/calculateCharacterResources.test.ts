import { describe, expect, it } from "vitest";
import { createCharacterResourceCurvesFixture } from "../../../test/fixtures/characterProgression.fixture";
import { applyResourceMultipliers, calculateBaseCharacterResources } from "./calculateCharacterResources";

describe("character resources", () => {
  it("selects resource values using their governing effective attributes", () => {
    const result = calculateBaseCharacterResources({
      vigor: 50, mind: 30, endurance: 25, strength: 10,
      dexterity: 10, intelligence: 10, faith: 10, arcane: 10,
    }, createCharacterResourceCurvesFixture());
    expect(result).toEqual({ maxHp: 1704, maxFp: 173, maxStamina: 121, maxEquipLoad: 72 });
  });

  it("applies multipliers with resource-specific precision", () => {
    expect(applyResourceMultipliers(
      { maxHp: 1704, maxFp: 173, maxStamina: 121, maxEquipLoad: 72 },
      { maxHp: 1.08, maxFp: 1, maxStamina: 1.1, maxEquipLoad: 1.19 },
    )).toEqual({ maxHp: 1840, maxFp: 173, maxStamina: 133, maxEquipLoad: 85.6 });
  });
});
