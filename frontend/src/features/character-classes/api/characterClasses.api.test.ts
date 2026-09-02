import { afterEach, describe, expect, it, vi } from "vitest";
import { getCharacterClasses } from "./characterClasses.api";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("getCharacterClasses", () => {
  it("returns frontend-ready absolute image URLs", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(
      new Response(JSON.stringify({
        status: 200,
        message: "Character classes found",
        data: [{
          id: "vagabond",
          name: "Vagabond",
          imageUrl: "/api/assets/character-classes/vagabond",
          level: 9,
          stats: {
            vigor: 15, mind: 10, endurance: 11, strength: 14,
            dexterity: 13, intelligence: 9, faith: 9, arcane: 7,
          },
          gameVersion: "1.17.0",
        }],
      }), { status: 200, headers: { "Content-Type": "application/json" } }),
    ));

    const response = await getCharacterClasses();

    expect(response.data[0]?.imageUrl).toBe(
      "http://localhost:3000/api/assets/character-classes/vagabond",
    );
  });
});
