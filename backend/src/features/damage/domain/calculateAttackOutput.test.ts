import { describe, expect, it } from "vitest";
import type { WeaponSkillAttack } from "../../weapons/domain/weaponSkill.types";
import { calculateAttackOutput } from "./calculateAttackOutput";

const attackRating = {
  physical: 251,
  magic: 420,
  fire: 0,
  lightning: 0,
  holy: 0,
};

const transientMoonlightLight: WeaponSkillAttack = {
  id: "transient-moonlight-light",
  name: "Transient Moonlight (Light)",
  fpCost: 15,
  components: [
    {
      kind: "projectile",
      sourceBehaviorId: 300905900,
      sourceBulletId: 2950,
      sourceAttackId: 303400100,
      physicalAttackType: "pierce",
      motionValues: damage(0),
      addedDamage: { ...damage(0), magic: 140 },
      finalDamageRates: damage(0.65),
    },
    {
      kind: "weapon-hit",
      sourceBehaviorId: 300905901,
      sourceAttackId: 303400101,
      physicalAttackType: "standard",
      motionValues: damage(50),
      addedDamage: damage(0),
      finalDamageRates: damage(0.8),
    },
  ],
};

describe("calculateAttackOutput", () => {
  it("returns boss-independent offensive output by component", () => {
    const result = calculateAttackOutput(
      attackRating,
      transientMoonlightLight,
    );

    expect(result).not.toHaveProperty("damage");
    expect(result.components).toMatchObject([
      { kind: "projectile", offensiveOutput: { magic: 91, total: 91 } },
      { kind: "weapon-hit", offensiveOutput: { physical: 100, magic: 168, total: 268 } },
    ]);
    expect(result.offensiveOutput).toEqual({
      physical: 100,
      magic: 259,
      fire: 0,
      lightning: 0,
      holy: 0,
      total: 359,
    });
  });

  it("optionally applies boss defense and matching absorption", () => {
    const result = calculateAttackOutput(
      attackRating,
      transientMoonlightLight,
      {
        id: "test-boss",
        name: "Test Boss",
        defense: damage(100),
        absorption: {
          physical: { standard: 20, slash: 10, strike: 0, pierce: -10 },
          magic: 40,
          fire: 0,
          lightning: 0,
          holy: 0,
        },
      },
    );

    expect(result.target).toEqual({ id: "test-boss", name: "Test Boss" });
    expect(result.components).toMatchObject([
      { kind: "projectile", damage: { magic: 18, total: 18 } },
      { kind: "weapon-hit", damage: { physical: 32, magic: 61, total: 93 } },
    ]);
    expect(result.damage).toEqual({
      physical: 32,
      magic: 79,
      fire: 0,
      lightning: 0,
      holy: 0,
      total: 111,
    });
  });
});

function damage(value: number) {
  return {
    physical: value,
    magic: value,
    fire: value,
    lightning: value,
    holy: value,
  };
}
