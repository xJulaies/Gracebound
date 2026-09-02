import type { RequestHandler } from "express";
import request from "supertest";
import { beforeEach, describe, expect, it } from "vitest";
import { createApp } from "../../app";
import { saveGreatRuneCatalog } from "../../infrastructure/regulation/services/saveGreatRuneCatalog";
import {
  REGULATION_TEST_GAME_VERSION,
  REGULATION_TEST_SOURCE_HASH,
} from "../../test/fixtures/regulationWeaponCatalog.fixture";
import { useMongoMemoryServer } from "../../test/useMongoMemoryServer";
import type { GreatRuneData, GreatRuneEffects } from "./domain/greatRune.types";

const passThroughAuthentication: RequestHandler = (_request, _response, next) => next();
const app = createApp({
  authenticationMiddleware: passThroughAuthentication,
  getAuthenticatedUserId: () => null,
});

useMongoMemoryServer({ replicaSet: true });

beforeEach(async () => {
  await saveGreatRuneCatalog(greatRunes, {
    gameVersion: REGULATION_TEST_GAME_VERSION,
    sourceHash: REGULATION_TEST_SOURCE_HASH,
  });
});

describe("public Great Rune API", () => {
  it("returns the complete sorted catalog without Regulation internals", async () => {
    const response = await request(app).get("/api/great-runes");

    expect(response.status).toBe(200);
    expect(response.body.data).toHaveLength(7);
    expect(response.body.data[0]).toMatchObject({
      id: "godricks-great-rune",
      iconUrl: "/api/assets/icons/3201",
      activation: "rune-arc",
      calculationStatus: "supported",
      gameVersion: REGULATION_TEST_GAME_VERSION,
    });
    expect(response.body.data[0]).not.toHaveProperty("sourceGoodsId");
    expect(response.body.data[0]).not.toHaveProperty("sourceEffectId");
  });

  it("returns one-element or empty arrays for detail requests", async () => {
    const [found, missing, invalid] = await Promise.all([
      request(app).get("/api/great-runes/radahns-great-rune"),
      request(app).get("/api/great-runes/unknown"),
      request(app).get("/api/great-runes/not_valid"),
    ]);

    expect(found.status).toBe(200);
    expect(found.body.data).toHaveLength(1);
    expect(missing.status).toBe(404);
    expect(missing.body.data).toEqual([]);
    expect(invalid.status).toBe(400);
    expect(invalid.body.data).toEqual([]);
  });
});

const noEffects: GreatRuneEffects = {
  attributeBonuses: {
    vigor: 0,
    mind: 0,
    endurance: 0,
    strength: 0,
    dexterity: 0,
    intelligence: 0,
    faith: 0,
    arcane: 0,
  },
  resourceMultipliers: { maxHp: 1, maxFp: 1, maxStamina: 1 },
};

const runeNames = ["Godrick's", "Radahn's", "Morgott's", "Rykard's", "Mohg's", "Malenia's"];
const runeIds = ["godricks", "radahns", "morgotts", "rykards", "mohgs", "malenias"];

const greatRunes: GreatRuneData[] = [
  ...runeNames.map((name, index): GreatRuneData => ({
    id: `${runeIds[index]}-great-rune`,
    sourceGoodsId: 191 + index,
    sourceEffectId: 600 + index * 10,
    name: `${name} Great Rune`,
    iconId: 3201 + index,
    activation: "rune-arc",
    calculationStatus: index < 3 ? "supported" : "catalog-only",
    effects: index < 3 ? noEffects : null,
    limitations: [],
  })),
  {
    id: "great-rune-of-the-unborn",
    sourceGoodsId: 10080,
    sourceEffectId: null,
    name: "Great Rune of the Unborn",
    iconId: 3202,
    activation: "not-applicable",
    calculationStatus: "catalog-only",
    effects: null,
    limitations: ["No Rune Arc combat effect."],
  },
];
