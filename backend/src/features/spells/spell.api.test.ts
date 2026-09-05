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
    spell("glintstone-pebble", "Glintstone Pebble", "sorcery", ["glintstone"]),
    spell("gravity-well", "Gravity Well", "sorcery", ["gravity"]),
    spell("lightning-spear", "Lightning Spear", "incantation", ["dragon-cult"]),
  ], { gameVersion: REGULATION_TEST_GAME_VERSION, sourceHash: REGULATION_TEST_SOURCE_HASH });
});

describe("public spell API", () => {
  it("lists catalog data and filters by type without Regulation internals", async () => {
    const [all, sorceries] = await Promise.all([
      request(app).get("/api/spells"),
      request(app).get("/api/spells?type=sorcery"),
    ]);
    expect(all.status).toBe(200);
    expect(all.body.data).toHaveLength(3);
    expect(all.body.data[0].iconUrl).toBe("/api/assets/icons/1");
    expect(sorceries.status).toBe(200);
    expect(sorceries.body.data).toEqual(expect.arrayContaining([
      expect.objectContaining({ id: "glintstone-pebble", type: "sorcery" }),
    ]));
    expect(all.body.data[0]).not.toHaveProperty("sourceMagicId");
  });

  it("supports search, school filters, pagination, and a stable alphabetical order", async () => {
    const [filtered, firstPage, secondPage] = await Promise.all([
      request(app).get("/api/spells?type=sorcery&school=gravity&search=well"),
      request(app).get("/api/spells?page=1&limit=2"),
      request(app).get("/api/spells?page=2&limit=2"),
    ]);

    expect(filtered.status).toBe(200);
    expect(filtered.headers["x-total-count"]).toBe("1");
    expect(filtered.body.data).toEqual([
      expect.objectContaining({
        id: "gravity-well",
        schools: ["gravity"],
        type: "sorcery",
      }),
    ]);
    expect(firstPage.headers["x-total-count"]).toBe("3");
    expect(firstPage.body.data.map(({ name }: { name: string }) => name))
      .toEqual(["Glintstone Pebble", "Gravity Well"]);
    expect(secondPage.body.data.map(({ name }: { name: string }) => name))
      .toEqual(["Lightning Spear"]);
  });

  it("returns one-element or empty arrays and rejects invalid filters", async () => {
    const [found, missing, invalidId, invalidFilter, invalidSchool] = await Promise.all([
      request(app).get("/api/spells/lightning-spear"),
      request(app).get("/api/spells/unknown"),
      request(app).get("/api/spells/not_valid"),
      request(app).get("/api/spells?type=spirit"),
      request(app).get("/api/spells?school=unknown"),
    ]);
    expect(found.status).toBe(200);
    expect(found.body.data).toHaveLength(1);
    expect(missing.status).toBe(404);
    expect(missing.body.data).toEqual([]);
    expect(invalidId.status).toBe(400);
    expect(invalidFilter.status).toBe(400);
    expect(invalidSchool.status).toBe(400);
  });

  it("preserves imported item text when Regulation data is refreshed", async () => {
    const enrichedSpell = {
      ...spell("gravity-well", "Gravity Well", "sorcery", ["gravity"]),
      summary: "Fires a projectile of condensed gravitational force.",
      description: "One of the glintstone sorceries that manipulates gravitational forces.",
    } satisfies SpellData;
    await saveSpellCatalog(
      [enrichedSpell],
      { gameVersion: REGULATION_TEST_GAME_VERSION, sourceHash: REGULATION_TEST_SOURCE_HASH },
    );
    await saveSpellCatalog(
      [spell("gravity-well", "Gravity Well", "sorcery", ["gravity"])],
      { gameVersion: REGULATION_TEST_GAME_VERSION, sourceHash: REGULATION_TEST_SOURCE_HASH },
    );

    const response = await request(app).get("/api/spells/gravity-well");

    expect(response.status).toBe(200);
    expect(response.body.data[0]).toEqual(expect.objectContaining({
      summary: enrichedSpell.summary,
      description: enrichedSpell.description,
    }));
  });
});

function spell(
  id: string,
  name: string,
  type: SpellData["type"],
  schools: SpellData["schools"],
): SpellData {
  return {
    id, sourceMagicId: id.length, name, type, schools, fpCost: 10, slotsRequired: 1,
    requirements: { intelligence: type === "sorcery" ? 10 : 0, faith: type === "incantation" ? 10 : 0, arcane: 0 },
    iconId: 1, calculationStatus: "catalog-only", buffEffect: null, attack: null,
    chargedFpCost: null, sustainedFpCost: null, chargedAttack: null,
  };
}
