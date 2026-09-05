import { describe, expect, it } from "vitest";
import { getBuildStatHighlights } from "./getBuildStatHighlights";

describe("getBuildStatHighlights", () => {
  it("returns the three highest stats with deterministic ties", () => {
    expect(
      getBuildStatHighlights({
        vigor: 40,
        mind: 15,
        endurance: 20,
        strength: 50,
        dexterity: 50,
        intelligence: 10,
        faith: 8,
        arcane: 12,
      }),
    ).toEqual([
      { label: "Dexterity", value: 50 },
      { label: "Strength", value: 50 },
      { label: "Vigor", value: 40 },
    ]);
  });
});
