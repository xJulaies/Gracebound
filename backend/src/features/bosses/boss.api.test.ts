import type { RequestHandler } from "express";
import request from "supertest";
import { beforeEach, describe, expect, it } from "vitest";
import { createApp } from "../../app";
import { saveBossDataSet } from "../../infrastructure/regulation/services/saveBossDataSet";
import { saveBossImageAsset } from "../../infrastructure/bossImages/saveBossImageAsset";
import { useMongoMemoryServer } from "../../test/useMongoMemoryServer";
import { unclassifiedBossMetadata, type BossData } from "./domain/boss.types";

const passThroughAuthentication: RequestHandler = (_request, _response, next) => {
  next();
};

const app = createApp({
  authenticationMiddleware: passThroughAuthentication,
  getAuthenticatedUserId: () => null,
});

useMongoMemoryServer({ replicaSet: true });

const sourceHash = "b".repeat(64);
const bosses: BossData[] = [
  {
    ...unclassifiedBossMetadata,
    id: "margit-the-fell-omen",
    name: "Margit, the Fell Omen",
    health: 4174,
    defense: {
      physical: 103,
      magic: 103,
      fire: 103,
      lightning: 103,
      holy: 103,
    },
    absorption: {
      physical: { standard: 0, slash: 0, strike: 0, pierce: 0 },
      magic: 0,
      fire: 0,
      lightning: 0,
      holy: 40,
    },
    phases: [{
      id: "margit-phase-two",
      name: "Margit, Phase Two",
      phaseNumber: 2,
      trigger: { type: "health-percentage", threshold: 60 },
      health: 4174,
      defense: {
        physical: 103,
        magic: 103,
        fire: 103,
        lightning: 103,
        holy: 103,
      },
      absorption: {
        physical: { standard: 0, slash: 0, strike: 0, pierce: 0 },
        magic: 0,
        fire: 0,
        lightning: 0,
        holy: 40,
      },
    }],
    sourceNpcId: 21300014,
    healthScalingEffectId: 7030,
  },
  {
    ...unclassifiedBossMetadata,
    id: "fire-giant",
    name: "Fire Giant",
    encounters: [{
      region: "mountaintops-of-the-giants",
      location: "Flame Peak",
      locationType: "open-world",
    }],
    rank: "major",
    progression: "required",
    rewardsGreatRune: false,
    rewardsRemembrance: true,
    health: 43263,
    defense: {
      physical: 120,
      magic: 120,
      fire: 120,
      lightning: 120,
      holy: 120,
    },
    absorption: {
      physical: { standard: 10, slash: 10, strike: 10, pierce: 10 },
      magic: 20,
      fire: 50,
      lightning: 0,
      holy: 20,
    },
    sourceNpcId: 47601050,
    healthScalingEffectId: 7140,
  },
];

beforeEach(async () => {
  await saveBossDataSet(bosses, {
    gameVersion: "1.17.0",
    sourceHash,
  });
  await Promise.all([
    saveBossImageAsset(createBossImageAsset("margit-the-fell-omen"), "1.17.0"),
    saveBossImageAsset(createBossImageAsset("margit-phase-two"), "1.17.0"),
  ]);
});

describe("public boss API", () => {
  it("returns all bosses from the active game version", async () => {
    await saveBossDataSet([{ ...bosses[0]!, health: 1 }], {
      gameVersion: "1.15.0",
      sourceHash,
    });

    const response = await request(app).get("/api/bosses");

    expect(response.status).toBe(200);
    expect(response.body.data.map(({ id }: { id: string }) => id)).toEqual([
      "fire-giant",
      "margit-the-fell-omen",
    ]);
    expect(response.body.data[0]).not.toHaveProperty("_id");
    expect(response.body.data[0]).not.toHaveProperty("sourceHash");
    expect(response.body.data[0]).not.toHaveProperty("sourceNpcId");
    expect(response.body.data[0]).not.toHaveProperty("healthScalingEffectId");
  });

  it("returns one normalized boss by its stable ID", async () => {
    const response = await request(app).get("/api/bosses/fire-giant");

    expect(response.status).toBe(200);
    expect(response.body.data).toEqual([
      {
        id: "fire-giant",
        name: "Fire Giant",
        imageUrl: null,
        encounters: [{
          region: "mountaintops-of-the-giants",
          location: "Flame Peak",
          locationType: "open-world",
        }],
        rank: "major",
        progression: "required",
        rewardsGreatRune: false,
        rewardsRemembrance: true,
        health: 43263,
        defense: {
          physical: 120,
          magic: 120,
          fire: 120,
          lightning: 120,
          holy: 120,
        },
        absorption: {
          physical: { standard: 10, slash: 10, strike: 10, pierce: 10 },
          magic: 20,
          fire: 50,
          lightning: 0,
          holy: 20,
        },
        phases: [],
        gameVersion: "1.17.0",
      },
    ]);
  });

  it("exposes only database-backed boss and phase portrait URLs", async () => {
    const margitResponse = await request(app).get("/api/bosses/margit-the-fell-omen");
    const fireGiantResponse = await request(app).get("/api/bosses/fire-giant");

    expect(margitResponse.body.data[0]).toMatchObject({
      imageUrl: "/api/assets/bosses/margit-the-fell-omen",
      phases: [{
        id: "margit-phase-two",
        imageUrl: "/api/assets/bosses/margit-phase-two",
      }],
    });
    expect(fireGiantResponse.body.data[0].imageUrl).toBeNull();
  });

  it("searches and filters the paginated boss catalog", async () => {
    const response = await request(app).get(
      "/api/bosses?search=fire&region=mountaintops-of-the-giants"
        + "&locationType=open-world&progression=required"
        + "&rewardsRemembrance=true&page=1&limit=10",
    );

    expect(response.status).toBe(200);
    expect(response.headers["x-total-count"]).toBe("1");
    expect(response.body.data.map(({ id }: { id: string }) => id)).toEqual([
      "fire-giant",
    ]);
  });

  it("rejects unsupported boss filters", async () => {
    const response = await request(app).get("/api/bosses?region=the-lands-between");

    expect(response.status).toBe(400);
    expect(response.body.data).toEqual([]);
  });

  it("returns not found for an unknown valid boss ID", async () => {
    const response = await request(app).get("/api/bosses/unknown-boss");

    expect(response.status).toBe(404);
    expect(response.body.data).toEqual([]);
  });

  it("rejects an invalid boss ID", async () => {
    const response = await request(app).get("/api/bosses/not_valid");

    expect(response.status).toBe(400);
    expect(response.body.data).toEqual([]);
  });
});

function createBossImageAsset(bossId: string) {
  const data = Buffer.from(`image-${bossId}`);
  return {
    bossId,
    checksum: "a".repeat(64),
    mimeType: "image/webp" as const,
    width: 320,
    height: 320,
    size: data.length,
    data,
    sourceHash: "c".repeat(64),
  };
}
