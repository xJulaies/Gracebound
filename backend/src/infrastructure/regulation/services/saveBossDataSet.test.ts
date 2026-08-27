import { afterEach, describe, expect, it, vi } from "vitest";
import type { BossData } from "../../../features/bosses/domain/boss.types";
import { BossModel } from "../../../features/bosses/models/boss.model";
import { useMongoMemoryServer } from "../../../test/useMongoMemoryServer";
import { saveBossDataSet } from "./saveBossDataSet";

useMongoMemoryServer({ replicaSet: true });

afterEach(() => {
  vi.restoreAllMocks();
});

const sourceHash =
  "7b6d07c357b639c902d48403ffe3612db35e0cf8d6fcc82d3fb24ea6eb6cf30a";

const defense = {
  physical: 100,
  magic: 100,
  fire: 100,
  lightning: 100,
  holy: 100,
};

const absorption = {
  physical: { standard: 0, slash: 0, strike: 0, pierce: 0 },
  magic: 0,
  fire: 0,
  lightning: 0,
  holy: 0,
};

const bosses: BossData[] = [
  {
    id: "margit-the-fell-omen",
    name: "Margit, the Fell Omen",
    health: 4174,
    defense,
    absorption,
    sourceNpcId: 21300014,
    healthScalingEffectId: 7030,
  },
  {
    id: "fire-giant",
    name: "Fire Giant",
    health: 43263,
    defense,
    absorption,
    sourceNpcId: 47601050,
    healthScalingEffectId: 7140,
  },
];

describe("saveBossDataSet", () => {
  it("persists normalized bosses with their source metadata", async () => {
    const summary = await saveBossDataSet(bosses, {
      gameVersion: "1.16.1",
      sourceHash,
    });

    expect(summary).toEqual({ gameVersion: "1.16.1", bosses: 2 });
    expect(await BossModel.countDocuments()).toBe(2);

    const fireGiant = await BossModel.findOne({ id: "fire-giant" }).lean();
    expect(fireGiant).toMatchObject({
      source: "REGULATION",
      gameVersion: "1.16.1",
      sourceHash,
      health: 43263,
      sourceNpcId: 47601050,
    });
    expect(fireGiant?.importedAt).toBeInstanceOf(Date);
  });

  it("replaces only the imported game version", async () => {
    await saveBossDataSet(bosses, {
      gameVersion: "1.16.1",
      sourceHash,
    });
    await saveBossDataSet([bosses[0]!], {
      gameVersion: "1.15.0",
      sourceHash,
    });

    const updatedMargit = { ...bosses[0]!, health: 5000 };
    await saveBossDataSet([updatedMargit], {
      gameVersion: "1.16.1",
      sourceHash,
    });

    expect(await BossModel.countDocuments({ gameVersion: "1.16.1" })).toBe(1);
    expect(await BossModel.countDocuments({ gameVersion: "1.15.0" })).toBe(1);
    expect(
      await BossModel.findOne({
        gameVersion: "1.16.1",
        id: "margit-the-fell-omen",
      })
        .select("health")
        .lean(),
    ).toMatchObject({ health: 5000 });
  });

  it("rolls back the replacement when inserting fails", async () => {
    await saveBossDataSet(bosses, {
      gameVersion: "1.16.1",
      sourceHash,
    });
    vi.spyOn(BossModel, "insertMany").mockRejectedValueOnce(
      new Error("Simulated boss insert failure"),
    );

    await expect(
      saveBossDataSet([bosses[0]!], {
        gameVersion: "1.16.1",
        sourceHash,
      }),
    ).rejects.toThrow("Simulated boss insert failure");

    expect(await BossModel.countDocuments({ gameVersion: "1.16.1" })).toBe(2);
  });

  it("rejects invalid records before opening a transaction", async () => {
    await expect(
      saveBossDataSet([{ ...bosses[0]!, health: 0 }], {
        gameVersion: "1.16.1",
        sourceHash: "invalid",
      }),
    ).rejects.toThrow();

    expect(await BossModel.countDocuments()).toBe(0);
  });

  it("rejects duplicate application IDs", async () => {
    await expect(
      saveBossDataSet([bosses[0]!, bosses[0]!], {
        gameVersion: "1.16.1",
        sourceHash,
      }),
    ).rejects.toThrow("Boss dataset contains duplicate IDs");
  });
});
