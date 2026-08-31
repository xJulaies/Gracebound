import type { RequestHandler } from "express";
import request from "supertest";
import { beforeEach, describe, expect, it } from "vitest";
import { createApp } from "../../app";
import { saveSpellCatalog } from "../../infrastructure/regulation/services/saveSpellCatalog";
import { REGULATION_TEST_GAME_VERSION, REGULATION_TEST_SOURCE_HASH } from "../../test/fixtures/regulationWeaponCatalog.fixture";
import { useMongoMemoryServer } from "../../test/useMongoMemoryServer";
import type { SpellData } from "./domain/spell.types";

const passThroughAuthentication: RequestHandler = (_request, _response, next) => next();
const app = createApp({ authenticationMiddleware: passThroughAuthentication, getAuthenticatedUserId: () => null });
useMongoMemoryServer({ replicaSet: true });

beforeEach(async () => {
  await saveSpellCatalog([
    spell("glintstone-pebble", "Glintstone Pebble", "sorcery"),
    spell("lightning-spear", "Lightning Spear", "incantation"),
  ], { gameVersion: REGULATION_TEST_GAME_VERSION, sourceHash: REGULATION_TEST_SOURCE_HASH });
});

describe("public spell API", () => {
  it("lists catalog data and filters by type without Regulation internals", async () => {
    const [all, sorceries] = await Promise.all([
      request(app).get("/api/spells"),
      request(app).get("/api/spells?type=sorcery"),
    ]);
    expect(all.status).toBe(200);
    expect(all.body.data).toHaveLength(2);
    expect(sorceries.status).toBe(200);
    expect(sorceries.body.data).toEqual([expect.objectContaining({ id: "glintstone-pebble", type: "sorcery" })]);
    expect(all.body.data[0]).not.toHaveProperty("sourceMagicId");
  });

  it("returns one-element or empty arrays and rejects invalid filters", async () => {
    const [found, missing, invalidId, invalidFilter] = await Promise.all([
      request(app).get("/api/spells/lightning-spear"),
      request(app).get("/api/spells/unknown"),
      request(app).get("/api/spells/not_valid"),
      request(app).get("/api/spells?type=spirit"),
    ]);
    expect(found.status).toBe(200);
    expect(found.body.data).toHaveLength(1);
    expect(missing.status).toBe(404);
    expect(missing.body.data).toEqual([]);
    expect(invalidId.status).toBe(400);
    expect(invalidFilter.status).toBe(400);
  });
});

function spell(id: string, name: string, type: SpellData["type"]): SpellData {
  return {
    id, sourceMagicId: id.length, name, type, fpCost: 10, slotsRequired: 1,
    requirements: { intelligence: type === "sorcery" ? 10 : 0, faith: type === "incantation" ? 10 : 0, arcane: 0 },
    iconId: 1, calculationStatus: "catalog-only", attack: null,
  };
}
