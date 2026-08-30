import { describe, expect, it } from "vitest";
import { mapRegulationCharacterClasses } from "./mapRegulationCharacterClasses";

describe("mapRegulationCharacterClasses", () => {
  it("maps exactly the ten retail classes through originChrInitParam", () => {
    const selections = Array.from({ length: 10 }, (_, index) => ({
      ID: 2000 + index,
      Name: index === 0 ? "Vagabond" : `Class ${index}`,
      originChrInitParam: 3000 + index,
    }));
    selections.push({ ID: 1000, Name: "[CNT] Knight", originChrInitParam: 1000 });
    const initialStats = Array.from({ length: 10 }, (_, index) => ({
      ID: 3000 + index,
      soulLv: index === 0 ? 9 : 1,
      baseVit: index === 0 ? 15 : 10,
      baseWil: 10,
      baseEnd: 10,
      baseStr: index === 0 ? 14 : 10,
      baseDex: 10,
      baseMag: 10,
      baseFai: 10,
      baseLuc: 10,
    }));

    const result = mapRegulationCharacterClasses(selections, initialStats);

    expect(result).toHaveLength(10);
    expect(result[0]).toEqual({
      id: "vagabond",
      name: "Vagabond",
      level: 9,
      stats: {
        vigor: 15, mind: 10, endurance: 10, strength: 14,
        dexterity: 10, intelligence: 10, faith: 10, arcane: 10,
      },
    });
  });

  it("rejects a missing initial-stat reference", () => {
    const selections = Array.from({ length: 10 }, (_, index) => ({
      ID: 2000 + index,
      Name: `Class ${index}`,
      originChrInitParam: 3000 + index,
    }));

    expect(() => mapRegulationCharacterClasses(selections, [])).toThrow(
      "Missing CharaInitParam 3000",
    );
  });
});
