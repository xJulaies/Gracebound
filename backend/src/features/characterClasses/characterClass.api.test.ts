import type { RequestHandler } from "express";
import request from "supertest";
import { beforeEach, describe, expect, it } from "vitest";
import { createApp } from "../../app";
import { saveCharacterClassCatalog } from "../../infrastructure/regulation/services/saveCharacterClassCatalog";
import { REGULATION_TEST_GAME_VERSION, REGULATION_TEST_SOURCE_HASH } from "../../test/fixtures/regulationWeaponCatalog.fixture";
import { useMongoMemoryServer } from "../../test/useMongoMemoryServer";
import type { CharacterClassData } from "./domain/characterClass.types";
import { createCharacterResourceCurvesFixture } from "../../test/fixtures/characterProgression.fixture";

const passThroughAuthentication: RequestHandler = (_request, _response, next) => next();
const app = createApp({ authenticationMiddleware: passThroughAuthentication, getAuthenticatedUserId: () => null });

useMongoMemoryServer({ replicaSet: true });

beforeEach(async () => {
  await saveCharacterClassCatalog(classes, createCharacterResourceCurvesFixture(), {
    gameVersion: REGULATION_TEST_GAME_VERSION,
    sourceHash: REGULATION_TEST_SOURCE_HASH,
  });
});

describe("GET /api/character-classes", () => {
  it("returns all ten classes without import metadata", async () => {
    const response = await request(app).get("/api/character-classes");
    expect(response.status).toBe(200);
    expect(response.body.data).toHaveLength(10);
    expect(response.body.data[0]).toMatchObject({
      id: "wretch",
      imageUrl: "/api/assets/character-classes/wretch",
      level: 1,
      stats: baseStats,
    });
    expect(response.body.data[0]).not.toHaveProperty("sourceHash");
  });
});

const baseStats = {
  vigor: 10, mind: 10, endurance: 10, strength: 10,
  dexterity: 10, intelligence: 10, faith: 10, arcane: 10,
};
const classes: CharacterClassData[] = Array.from({ length: 10 }, (_, index) => ({
  id: index === 0 ? "wretch" : `class-${index}`,
  name: index === 0 ? "Wretch" : `Class ${index}`,
  level: index + 1,
  stats: baseStats,
}));
