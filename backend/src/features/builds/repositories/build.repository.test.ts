import { describe, expect, it } from "vitest";
import { useMongoMemoryServer } from "../../../test/useMongoMemoryServer";
import { BuildModel } from "../models/build.model";
import {
  createBuild,
  deleteOwnedBuildById,
  findAllBuildsByOwner,
  findAllPublicBuilds,
  findOwnedBuildById,
  findPublicBuildById,
  updateOwnedBuildById,
} from "./build.repository";

useMongoMemoryServer();

const stats = {
  vigor: 40,
  mind: 20,
  endurance: 25,
  strength: 30,
  dexterity: 30,
  intelligence: 30,
  faith: 10,
  arcane: 10,
};

describe("buildRepository", () => {
  it("creates a build with its internal owner", async () => {
    const build = await createBuild({
      ownerId: "user-1",
      name: "Owned Build",
      level: 120,
      stats,
      equipment: {
        primaryWeaponId: null,
        weaponUpgradeLevel: 0,
        armor: {
          headId: null,
          chestId: null,
          armsId: null,
          legsId: null,
        },
        talismanIds: [],
      },
      description: "",
      visibility: "private",
    });

    expect(build.ownerId).toBe("user-1");
    expect(await BuildModel.countDocuments()).toBe(1);
  });

  it("returns only builds owned by the requested user", async () => {
    await BuildModel.create([
      { ownerId: "user-1", name: "First", level: 100, stats },
      { ownerId: "user-1", name: "Second", level: 100, stats },
      { ownerId: "user-2", name: "Foreign", level: 100, stats },
    ]);

    const builds = await findAllBuildsByOwner("user-1");

    expect(builds).toHaveLength(2);
    expect(builds.every((build) => build.ownerId === "user-1")).toBe(true);
  });

  it("cannot read another user's build through an owned query", async () => {
    const foreignBuild = await BuildModel.create({
      ownerId: "user-2",
      name: "Foreign",
      level: 100,
      stats,
    });

    expect(
      await findOwnedBuildById(foreignBuild.id, "user-1"),
    ).toBeNull();
    expect(
      await findOwnedBuildById(foreignBuild.id, "user-2"),
    ).not.toBeNull();
  });

  it("updates only a build owned by the requested user", async () => {
    const build = await BuildModel.create({
      ownerId: "user-1",
      name: "Original",
      level: 100,
      stats,
    });

    expect(
      await updateOwnedBuildById(build.id, "user-2", { name: "Stolen" }),
    ).toBeNull();

    const updated = await updateOwnedBuildById(build.id, "user-1", {
      name: "Updated",
    });
    expect(updated?.name).toBe("Updated");
  });

  it("deletes only a build owned by the requested user", async () => {
    const build = await BuildModel.create({
      ownerId: "user-1",
      name: "Owned",
      level: 100,
      stats,
    });

    expect(
      await deleteOwnedBuildById(build.id, "user-2"),
    ).toBeNull();
    expect(await deleteOwnedBuildById(build.id, "user-1")).not.toBeNull();
    expect(await BuildModel.findById(build.id)).toBeNull();
  });

  it("returns only public builds from public queries", async () => {
    const [publicBuild, privateBuild] = await BuildModel.create([
      {
        ownerId: "user-1",
        name: "Public",
        level: 100,
        stats,
        visibility: "public",
      },
      {
        ownerId: "user-1",
        name: "Private",
        level: 100,
        stats,
        visibility: "private",
      },
    ]);

    const publicBuilds = await findAllPublicBuilds();

    expect(publicBuilds).toHaveLength(1);
    expect(publicBuilds[0]?.id).toBe(publicBuild.id);
    expect(await findPublicBuildById(publicBuild.id)).not.toBeNull();
    expect(await findPublicBuildById(privateBuild.id)).toBeNull();
  });
});
