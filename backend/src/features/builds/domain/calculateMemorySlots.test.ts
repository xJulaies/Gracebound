import { describe, expect, it } from "vitest";
import { calculateMemorySlots } from "./calculateMemorySlots";

describe("calculateMemorySlots", () => {
  it("includes base slots, memory stones, and talisman bonuses", () => {
    expect(calculateMemorySlots(3, 2, [{ slotsRequired: 2 }, { slotsRequired: 1 }])).toEqual({
      availableSlots: 7,
      usedSlots: 3,
      remainingSlots: 4,
    });
  });

  it("allows an exactly full selection", () => {
    expect(calculateMemorySlots(0, 0, [{ slotsRequired: 2 }])).toEqual({
      availableSlots: 2,
      usedSlots: 2,
      remainingSlots: 0,
    });
  });

  it("rejects selections exceeding the available slots", () => {
    expect(() => calculateMemorySlots(0, 0, [{ slotsRequired: 3 }])).toThrow(
      "Selected spells exceed available memory slots",
    );
  });
});
