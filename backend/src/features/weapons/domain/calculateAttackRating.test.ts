import { describe, expect, it } from "vitest";
import { weaponFixtures } from "../data/weapon.fixtures";
import {
  calculateAttackRating,
  calculateScalingCorrection,
} from "./calculateAttackRating";

describe("calculateScalingCorrection", () => {
  it("interpolates the elemental curve between ERDB stages", () => {
    const curve = weaponFixtures.scalingCurves["erdb-4"];

    expect(curve).toBeDefined();
    expect(calculateScalingCorrection(70, curve!)).toBeCloseTo(0.9);
  });

  it("uses the non-linear adjustment of the default curve", () => {
    const curve = weaponFixtures.scalingCurves["erdb-0"];

    expect(curve).toBeDefined();
    expect(calculateScalingCorrection(12, curve!)).toBeCloseTo(
      0.148277,
      5,
    );
  });
});

describe("calculateAttackRating", () => {
  it("calculates Moonveil +10 split attack rating from ERDB 1.10.0 data", () => {
    const weapon = weaponFixtures.weapons.moonveil;

    expect(weapon).toBeDefined();
    expect(
      calculateAttackRating(
        weapon!,
        10,
        {
          strength: 12,
          dexterity: 30,
          intelligence: 70,
          faith: 8,
          arcane: 8,
        },
        weaponFixtures,
      ),
    ).toEqual({
      physical: 251,
      magic: 420,
      fire: 0,
      lightning: 0,
      holy: 0,
    });
  });

  it("applies the requirement penalty to an unusable weapon", () => {
    const weapon = weaponFixtures.weapons["grafted-blade-greatsword"];

    expect(weapon).toBeDefined();
    const attackRating = calculateAttackRating(
      weapon!,
      0,
      {
        strength: 10,
        dexterity: 10,
        intelligence: 10,
        faith: 10,
        arcane: 10,
      },
      weaponFixtures,
    );

    expect(attackRating.physical).toBe(97);
  });
});
