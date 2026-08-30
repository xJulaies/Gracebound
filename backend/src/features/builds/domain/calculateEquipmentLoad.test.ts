import { describe, expect, it } from "vitest";
import { calculateEquipmentLoad } from "./calculateEquipmentLoad";

describe("calculateEquipmentLoad", () => {
  it("sums every equipped item and returns a UI-ready ratio", () => {
    expect(calculateEquipmentLoad({
      armorWeight: 12.3,
      talismanWeights: [0.8, 0.8],
      weaponWeights: [6.5],
      maxEquipLoad: 72,
    })).toEqual({
      currentLoad: 20.4,
      maxEquipLoad: 72,
      loadRatio: 0.283333,
      loadPercentage: 28.333333,
      category: "light",
    });
  });

  it.each([
    [29.9, "light"],
    [30, "medium"],
    [69.9, "medium"],
    [70, "heavy"],
    [99.9, "heavy"],
    [100, "overloaded"],
  ] as const)("classifies %s percent as %s", (weight, category) => {
    expect(calculateEquipmentLoad({
      armorWeight: weight,
      talismanWeights: [],
      weaponWeights: [],
      maxEquipLoad: 100,
    }).category).toBe(category);
  });
});
