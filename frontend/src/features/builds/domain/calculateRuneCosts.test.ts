import { describe, expect, it } from "vitest";
import { calculateRuneCosts } from "./calculateRuneCosts";

describe("calculateRuneCosts", () => {
  it("updates the next and accumulated rune costs synchronously", () => {
    expect(calculateRuneCosts(6, 6)).toEqual({
      nextLevelRuneCost: 757,
      totalRuneCost: 0,
    });
    expect(calculateRuneCosts(6, 7)).toEqual({
      nextLevelRuneCost: 775,
      totalRuneCost: 757,
    });
  });

  it("has no next-level cost at the maximum level", () => {
    expect(calculateRuneCosts(713, 713)).toEqual({
      nextLevelRuneCost: null,
      totalRuneCost: 0,
    });
  });
});
