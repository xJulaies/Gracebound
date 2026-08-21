import { describe, expect, it } from "vitest";
import {
  calculateDamageAfterAbsorption,
  calculateDefenseMultiplier,
  calculateHitDamage,
} from "./calculateDamage";

describe("calculateDefenseMultiplier", () => {
  it.each([
    { attack: 100, defense: 800, multiplier: 0.1 },
    { attack: 100, defense: 100, multiplier: 0.4 },
    { attack: 250, defense: 100, multiplier: 0.7 },
    { attack: 800, defense: 100, multiplier: 0.9 },
  ])(
    "returns $multiplier at attack $attack and defense $defense",
    ({ attack, defense, multiplier }) => {
      expect(calculateDefenseMultiplier(attack, defense)).toBeCloseTo(
        multiplier,
      );
    },
  );

  it("returns zero when no damage is incoming", () => {
    expect(calculateDefenseMultiplier(0, 100)).toBe(0);
  });
});

describe("calculateDamageAfterAbsorption", () => {
  it("reduces damage by positive absorption", () => {
    expect(calculateDamageAfterAbsorption(100, 20)).toBe(80);
  });

  it("increases damage for a negative absorption weakness", () => {
    expect(calculateDamageAfterAbsorption(100, -20)).toBe(120);
  });
});

describe("calculateHitDamage", () => {
  it("calculates and floors every damage type independently", () => {
    const result = calculateHitDamage({
      attackRating: {
        physical: 100,
        magic: 100,
        fire: 0,
        lightning: 0,
        holy: 0,
      },
      motionValue: 100,
      target: {
        defense: 100,
        absorption: {
          physical: 20,
          magic: -20,
          fire: 0,
          lightning: 0,
          holy: 0,
        },
      },
    });

    expect(result.damage).toEqual({
      physical: 32,
      magic: 48,
      fire: 0,
      lightning: 0,
      holy: 0,
      total: 80,
    });
    expect(result.accuracy).toBe("estimated");
  });
});

