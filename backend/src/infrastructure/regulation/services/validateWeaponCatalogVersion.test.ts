import { describe, expect, it } from "vitest";
import { validateWeaponCatalogVersion } from "./validateWeaponCatalogVersion";

describe("validateWeaponCatalogVersion", () => {
  it("accepts the verified 1.17 catalog size", () => {
    expect(() =>
      validateWeaponCatalogVersion("1.17.0", {
        canonicalWeapons: 468,
        calculationVariants: 3192,
      }),
    ).not.toThrow();
  });

  it("blocks an incomplete 1.17 catalog before database access", () => {
    expect(() =>
      validateWeaponCatalogVersion("1.17.0", {
        canonicalWeapons: 460,
        calculationVariants: 3112,
      }),
    ).toThrow(
      "Incomplete weapon catalog for 1.17.0: expected 468 weapons and 3192 variants, mapped 460 weapons and 3112 variants",
    );
  });

  it("does not guess counts for an unknown future game version", () => {
    expect(() =>
      validateWeaponCatalogVersion("1.18.0", {
        canonicalWeapons: 1,
        calculationVariants: 1,
      }),
    ).not.toThrow();
  });
});
