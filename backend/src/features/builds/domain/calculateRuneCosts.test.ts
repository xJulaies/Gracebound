import { describe, expect, it } from "vitest";
import { calculateNextLevelRuneCost, calculateRuneCosts } from "./calculateRuneCosts";

describe("calculateRuneCosts", () => {
  it("matches known next-level costs across the progression curve", () => {
    expect(calculateNextLevelRuneCost(1)).toBe(673);
    expect(calculateNextLevelRuneCost(9)).toBe(811);
    expect(calculateNextLevelRuneCost(12)).toBe(1_038);
    expect(calculateNextLevelRuneCost(50)).toBe(15_102);
    expect(calculateNextLevelRuneCost(150)).toBe(153_680);
  });

  it("sums only levels invested after the selected class", () => {
    expect(calculateRuneCosts(9, 9)).toEqual({
      nextLevelRuneCost: 811,
      totalRuneCost: 0,
    });
    expect(calculateRuneCosts(9, 15)).toEqual({
      nextLevelRuneCost: 1_659,
      totalRuneCost: 6_208,
    });
  });

  it("does not expose a next-level cost at the level cap", () => {
    expect(calculateRuneCosts(713, 713)).toEqual({
      nextLevelRuneCost: null,
      totalRuneCost: 0,
    });
    expect(() => calculateNextLevelRuneCost(713)).toThrow(
      "Maximum character level has no next level",
    );
  });
});
