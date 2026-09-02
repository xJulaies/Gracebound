import { describe, expect, it } from "vitest";
import { compareIconCoverage } from "./auditIconCoverage";

describe("compareIconCoverage", () => {
  it("reports complete matching catalogs", () => {
    expect(compareIconCoverage([1, 2, 2], [2, 1])).toEqual({
      catalogIconIds: 2,
      storedIconIds: 2,
      missingIconIds: [],
      orphanedIconIds: [],
    });
  });

  it("reports sorted missing and orphaned icon IDs", () => {
    expect(compareIconCoverage([30, 10, 20], [40, 10, 50])).toEqual({
      catalogIconIds: 3,
      storedIconIds: 3,
      missingIconIds: [20, 30],
      orphanedIconIds: [40, 50],
    });
  });
});
