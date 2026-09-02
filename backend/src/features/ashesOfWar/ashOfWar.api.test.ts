import type { RequestHandler } from "express";
import request from "supertest";
import { beforeEach, describe, expect, it } from "vitest";
import { createApp } from "../../app";
import { saveAshOfWarCatalog } from "../../infrastructure/regulation/services/saveAshOfWarCatalog";
import { REGULATION_TEST_GAME_VERSION, REGULATION_TEST_SOURCE_HASH } from "../../test/fixtures/regulationWeaponCatalog.fixture";
import { useMongoMemoryServer } from "../../test/useMongoMemoryServer";
import type { AshOfWarData } from "./domain/ashOfWar.types";

const passThroughAuthentication: RequestHandler = (_request, _response, next) => next();
const app = createApp({ authenticationMiddleware: passThroughAuthentication, getAuthenticatedUserId: () => null });

useMongoMemoryServer({ replicaSet: true });

beforeEach(async () => {
  await saveAshOfWarCatalog(ashes, {
    gameVersion: REGULATION_TEST_GAME_VERSION,
    sourceHash: REGULATION_TEST_SOURCE_HASH,
  });
});

describe("public Ash of War API", () => {
  it("returns an array of selection data without Regulation internals", async () => {
    const response = await request(app).get("/api/ashes-of-war");

    expect(response.status).toBe(200);
    expect(response.body.data).toHaveLength(3);
    expect(response.body.data[0]).toMatchObject({
      id: "flame-of-the-redmanes",
      iconUrl: "/api/assets/icons/50500",
      compatibleWeaponTypes: ["straight-sword", "greatsword"],
      attacks: [{ id: "flame-of-the-redmanes", fpCost: 14 }],
    });
    expect(response.body.data[0]).not.toHaveProperty("sourceGemId");
    expect(response.body.data[0].attacks[0]).not.toHaveProperty("components");
    expect(response.body.data[2]).toMatchObject({
      id: "wild-strikes",
      calculationStatus: "catalog-only",
      attacks: [],
    });
  });

  it("filters by compatible weapon type", async () => {
    const response = await request(app).get("/api/ashes-of-war?weaponType=greatsword");
    expect(response.status).toBe(200);
    expect(response.body.data.map(({ id }: { id: string }) => id)).toEqual(["flame-of-the-redmanes"]);
  });

  it("filters by affinity and calculation support", async () => {
    const response = await request(app).get(
      "/api/ashes-of-war?affinity=heavy&calculationStatus=catalog-only",
    );
    expect(response.status).toBe(200);
    expect(response.body.data.map(({ id }: { id: string }) => id)).toEqual(["wild-strikes"]);
  });

  it("returns one entry and handles invalid or unknown IDs", async () => {
    const [found, unknown, invalid] = await Promise.all([
      request(app).get("/api/ashes-of-war/square-off"),
      request(app).get("/api/ashes-of-war/unknown"),
      request(app).get("/api/ashes-of-war/not_valid"),
    ]);
    expect(found.status).toBe(200);
    expect(found.body.data).toHaveLength(1);
    expect(unknown.status).toBe(404);
    expect(unknown.body.data).toEqual([]);
    expect(invalid.status).toBe(400);
    expect(invalid.body.data).toEqual([]);
  });
});

const ashes: AshOfWarData[] = [
  ash("square-off", 11500, 6, ["straight-sword"]),
  ash("flame-of-the-redmanes", 50500, 14, ["straight-sword", "greatsword"]),
  {
    id: "wild-strikes",
    sourceGemId: 10600,
    sourceSwordArtId: 106,
    name: "Wild Strikes",
    iconId: 10600,
    compatibleWeaponTypes: ["axe"],
    compatibleAffinities: ["standard", "heavy"],
    calculationStatus: "catalog-only",
    buffEffect: null,
    skill: null,
    skillVariants: [],
  },
];

function ash(id: string, sourceGemId: number, fpCost: number, compatibleWeaponTypes: string[]): AshOfWarData {
  const name = id.split("-").map((part) => part[0]!.toUpperCase() + part.slice(1)).join(" ");
  return {
    id, sourceGemId, name, iconId: sourceGemId, sourceSwordArtId: sourceGemId,
    compatibleWeaponTypes, compatibleAffinities: ["standard"],
    calculationStatus: "supported",
    buffEffect: null,
    skill: {
      id, name, sourceSwordArtId: sourceGemId,
      attacks: [{
        id, name, fpCost,
        components: [{
          kind: "weapon-hit", sourceBehaviorId: 1, sourceAttackId: 1,
          physicalAttackType: "standard",
          motionValues: damage(100), addedDamage: damage(0), finalDamageRates: damage(1),
        }],
      }],
    },
    skillVariants: [],
  };
}

function damage(value: number) {
  return { physical: value, magic: value, fire: value, lightning: value, holy: value };
}
