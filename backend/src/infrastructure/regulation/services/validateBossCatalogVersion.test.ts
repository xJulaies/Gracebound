import { describe, expect, it } from "vitest";
import type { BossData } from "../../../features/bosses/domain/boss.types";
import { validateBossCatalogVersion } from "./validateBossCatalogVersion";

function createBoss(id: string): BossData {
  return {
    id,
    name: id,
    health: 1,
    defense: { physical: 1, magic: 1, fire: 1, lightning: 1, holy: 1 },
    absorption: {
      physical: { standard: 0, slash: 0, strike: 0, pierce: 0 },
      magic: 0,
      fire: 0,
      lightning: 0,
      holy: 0,
    },
    sourceNpcId: 1,
    healthScalingEffectId: 1,
  };
}

describe("validateBossCatalogVersion", () => {
  it("accepts the verified 1.17.0 base-game catalog size", () => {
    const bosses = Array.from({ length: 177 }, (_, index) =>
      createBoss(`boss-${index}`),
    );

    expect(() => validateBossCatalogVersion(bosses, "1.17.0")).not.toThrow();
  });

  it("rejects incomplete and duplicate catalogs", () => {
    const incomplete = Array.from({ length: 176 }, (_, index) =>
      createBoss(`boss-${index}`),
    );
    const duplicate = Array.from({ length: 177 }, (_, index) =>
      createBoss(index === 176 ? "boss-0" : `boss-${index}`),
    );

    expect(() => validateBossCatalogVersion(incomplete, "1.17.0")).toThrow(
      "expected 177, received 176",
    );
    expect(() => validateBossCatalogVersion(duplicate, "1.17.0")).toThrow(
      "contains duplicate IDs",
    );
  });

  it("rejects unverified game versions", () => {
    expect(() => validateBossCatalogVersion([], "1.18.0")).toThrow(
      "Unsupported boss catalog version 1.18.0",
    );
  });
});
