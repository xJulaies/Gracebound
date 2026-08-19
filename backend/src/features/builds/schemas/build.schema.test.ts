import { describe, expect, it } from "vitest";
import { createBuildSchema, updateBuildSchema } from "./build.schema";

function createValidBuildInput() {
  return {
    name: "  Moonveil Build  ",
    description: "  Intelligence-focused build  ",
    level: 150,
    stats: {
      vigor: 50,
      mind: 30,
      endurance: 25,
      strength: 12,
      dexterity: 30,
      intelligence: 70,
      faith: 8,
      arcane: 8,
    },
    equipment: {
      primaryWeaponId: "moonveil",
      weaponUpgradeLevel: 10,
      armor: {
        headId: null,
        chestId: null,
        armsId: null,
        legsId: null,
      },
      talismanIds: ["shard-of-alexander"],
    },
    visibility: "public" as const,
  };
}

describe("createBuildSchema", () => {
  it("parses and trims a complete build", () => {
    const result = createBuildSchema.parse(createValidBuildInput());

    expect(result.name).toBe("Moonveil Build");
    expect(result.description).toBe("Intelligence-focused build");
    expect(result.visibility).toBe("public");
  });

  it("applies safe defaults for a new build", () => {
    const validBuild = createValidBuildInput();
    const input = {
      name: validBuild.name,
      level: validBuild.level,
      stats: validBuild.stats,
    };

    const result = createBuildSchema.parse(input);

    expect(result.description).toBe("");
    expect(result.visibility).toBe("private");
    expect(result.equipment).toEqual({
      primaryWeaponId: null,
      weaponUpgradeLevel: 0,
      armor: {
        headId: null,
        chestId: null,
        armsId: null,
        legsId: null,
      },
      talismanIds: [],
    });
  });

  it.each([
    ["empty name", { name: "" }],
    ["long name", { name: "a".repeat(81) }],
    ["long description", { description: "a".repeat(1001) }],
    ["level below minimum", { level: 0 }],
    ["level above maximum", { level: 714 }],
    ["decimal level", { level: 150.5 }],
  ])("rejects %s", (_case, changes) => {
    expect(() =>
      createBuildSchema.parse({ ...createValidBuildInput(), ...changes }),
    ).toThrow();
  });

  it.each([0, 100, 20.5])("rejects invalid stat value %s", (vigor) => {
    const input = createValidBuildInput();

    expect(() =>
      createBuildSchema.parse({
        ...input,
        stats: { ...input.stats, vigor },
      }),
    ).toThrow();
  });

  it.each([-1, 26, 10.5])(
    "rejects invalid weapon upgrade level %s",
    (weaponUpgradeLevel) => {
      const input = createValidBuildInput();

      expect(() =>
        createBuildSchema.parse({
          ...input,
          equipment: { ...input.equipment, weaponUpgradeLevel },
        }),
      ).toThrow();
    },
  );

  it("rejects an upgrade level when no weapon is selected", () => {
    const input = createValidBuildInput();

    expect(() =>
      createBuildSchema.parse({
        ...input,
        equipment: {
          ...input.equipment,
          primaryWeaponId: null,
          weaponUpgradeLevel: 10,
        },
      }),
    ).toThrow();
  });

  it("rejects more than four or duplicate talismans", () => {
    const input = createValidBuildInput();

    expect(() =>
      createBuildSchema.parse({
        ...input,
        equipment: {
          ...input.equipment,
          talismanIds: ["one", "two", "three", "four", "five"],
        },
      }),
    ).toThrow();

    expect(() =>
      createBuildSchema.parse({
        ...input,
        equipment: {
          ...input.equipment,
          talismanIds: ["one", "one"],
        },
      }),
    ).toThrow();
  });

  it("rejects client-controlled ownership and unknown fields", () => {
    expect(() =>
      createBuildSchema.parse({
        ...createValidBuildInput(),
        ownerId: "attacker-controlled-user",
      }),
    ).toThrow();
  });
});

describe("updateBuildSchema", () => {
  it("accepts a supported partial update", () => {
    expect(updateBuildSchema.parse({ name: "  Updated Build  " })).toEqual({
      name: "Updated Build",
    });
  });

  it("rejects an empty update", () => {
    expect(() => updateBuildSchema.parse({})).toThrow();
  });

  it("rejects immutable and unknown fields", () => {
    expect(() =>
      updateBuildSchema.parse({ ownerId: "another-user" }),
    ).toThrow();
  });
});
