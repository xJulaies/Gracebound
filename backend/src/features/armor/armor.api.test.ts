import type { RequestHandler } from "express";
import request from "supertest";
import { beforeEach, describe, expect, it } from "vitest";
import { createApp } from "../../app";
import { saveArmorCatalog } from "../../infrastructure/regulation/services/saveArmorCatalog";
import { REGULATION_TEST_GAME_VERSION, REGULATION_TEST_SOURCE_HASH } from "../../test/fixtures/regulationWeaponCatalog.fixture";
import { useMongoMemoryServer } from "../../test/useMongoMemoryServer";
import { neutralArmorPassiveEffects, type ArmorData, type ArmorSlot } from "./domain/armor.types";

const passThroughAuthentication: RequestHandler = (_request, _response, next) => next();
const app = createApp({ authenticationMiddleware: passThroughAuthentication, getAuthenticatedUserId: () => null });
useMongoMemoryServer({ replicaSet: true });

beforeEach(async () => {
  await saveArmorCatalog([
    armor("vagabond-knight-helm", "Vagabond Knight Helm", "head"),
    armor("vagabond-knight-armor", "Vagabond Knight Armor", "body"),
  ], { gameVersion: REGULATION_TEST_GAME_VERSION, sourceHash: REGULATION_TEST_SOURCE_HASH });
});

describe("public armor API", () => {
  it("returns selection and calculation data without Regulation internals", async () => {
    const response = await request(app).get("/api/armor");
    expect(response.status).toBe(200);
    expect(response.body.data).toHaveLength(2);
    expect(response.body.data[0]).toMatchObject({
      id: "vagabond-knight-armor", slot: "body",
      hasPassiveEffects: false, hasUnresolvedPassiveEffects: false,
    });
    expect(response.body.data[0]).not.toHaveProperty("sourceProtectorId");
    expect(response.body.data[0]).not.toHaveProperty("sourceEffectIds");
  });

  it("returns one-element or empty arrays for detail requests", async () => {
    const [found, missing, invalid] = await Promise.all([
      request(app).get("/api/armor/vagabond-knight-helm"),
      request(app).get("/api/armor/unknown"),
      request(app).get("/api/armor/not_valid"),
    ]);
    expect(found.status).toBe(200);
    expect(found.body.data).toHaveLength(1);
    expect(missing.status).toBe(404);
    expect(missing.body.data).toEqual([]);
    expect(invalid.status).toBe(400);
    expect(invalid.body.data).toEqual([]);
  });
});

function armor(id: string, name: string, slot: ArmorSlot): ArmorData {
  return {
    id, name, slot, sourceProtectorId: id.length, iconId: 1, weight: 4, poise: 7,
    damageNegation: { physical: 0.046, strike: 0.036, slash: 0.042, pierce: 0.04, magic: 0.031, fire: 0.036, lightning: 0.028, holy: 0.028 },
    resistances: { poison: 14, rot: 14, bleed: 23, frost: 23, sleep: 9, madness: 9, deathBlight: 9 },
    sourceEffectIds: [],
    hasUnresolvedPassiveEffects: false,
    passiveEffects: neutralArmorPassiveEffects(),
  };
}
