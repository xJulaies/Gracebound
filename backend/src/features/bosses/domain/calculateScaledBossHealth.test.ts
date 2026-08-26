import { describe, expect, it } from "vitest";
import { calculateScaledBossHealth } from "./calculateScaledBossHealth";

describe("calculateScaledBossHealth", () => {
  it("calculates Margit's scaled health using the game's rounding rule", () => {
    expect(calculateScaledBossHealth(2521, 1.656)).toBe(4174);
  });
});
