import { describe, expect, it } from "vitest";
import { useMongoMemoryServer } from "../../../test/useMongoMemoryServer";
import { BuildModel } from "./build.model";

useMongoMemoryServer();

describe("BuildModel", () => {
  it("persists a build with safe defaults and timestamps", async () => {
    const build = await BuildModel.create({
      ownerId: "user-1",
      name: "Strength Build",
      level: 100,
      stats: {
        vigor: 40,
        mind: 10,
        endurance: 30,
        strength: 60,
        dexterity: 15,
        intelligence: 9,
        faith: 9,
        arcane: 7,
      },
    });

    expect(build.description).toBe("");
    expect(build.characterClassId).toBeNull();
    expect(build.memoryStoneCount).toBe(0);
    expect(build.spellIds).toEqual([]);
    expect(build.visibility).toBe("private");
    expect(Object.values(build.toObject().equipment.weaponSlots)).toEqual([
      null, null, null, null, null, null,
    ]);
    expect(build.equipment.talismanIds).toEqual([]);
    expect(build.equipment.buffSpellIds).toEqual([]);
    expect(build.equipment.catalyst).toBeNull();
    expect(build.equipment.weaponBuff).toBeNull();
    expect(build.createdAt).toBeInstanceOf(Date);
    expect(build.updatedAt).toBeInstanceOf(Date);
    expect(build.toObject()).not.toHaveProperty("__v");
  });

  it("requires an owner", async () => {
    const build = new BuildModel({ name: "Ownerless Build" });

    await expect(build.validate()).rejects.toThrow();
  });

  it("defines indexes for owner and public build queries", () => {
    const indexes = BuildModel.schema.indexes().map(([fields]) => fields);

    expect(indexes).toContainEqual({ ownerId: 1, updatedAt: -1 });
    expect(indexes).toContainEqual({ visibility: 1, createdAt: -1 });
  });
});
