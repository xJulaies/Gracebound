import { afterEach, describe, expect, it, vi } from "vitest";
import { getBosses } from "../../bosses/api/bosses.api";
import { getCharacterClasses } from "../../character-classes/api/characterClasses.api";
import { getCrystalTears } from "../../crystal-tears/api/crystalTears.api";
import { getGreatRunes } from "../../great-runes/api/greatRunes.api";
import { getWeapons } from "../../weapons/api/weapons.api";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("build catalog API", () => {
  it("requests every catalog needed by the first build editor", async () => {
    const fetchMock = vi.fn().mockImplementation(() =>
      Promise.resolve(new Response(
        JSON.stringify({ status: 200, message: "Catalog found", data: [] }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      )),
    );
    vi.stubGlobal("fetch", fetchMock);

    await Promise.all([
      getCharacterClasses(),
      getWeapons(),
      getBosses(),
      getGreatRunes(),
      getCrystalTears(),
    ]);

    expect(fetchMock.mock.calls.map(([url]) => url)).toEqual([
      "http://localhost:3000/api/character-classes",
      "http://localhost:3000/api/weapons?page=1&limit=100",
      "http://localhost:3000/api/bosses",
      "http://localhost:3000/api/great-runes",
      "http://localhost:3000/api/crystal-tears",
    ]);
  });

  it("resolves Great Rune and Crystal Tear icon paths against the backend", async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({
        status: 200,
        message: "Great Runes found",
        data: [{ id: "godricks-great-rune", iconUrl: "/api/assets/icons/3201" }],
      }), { status: 200, headers: { "Content-Type": "application/json" } }))
      .mockResolvedValueOnce(new Response(JSON.stringify({
        status: 200,
        message: "Crystal Tears found",
        data: [{ id: "strength-knot-crystal-tear", iconUrl: "/api/assets/icons/423" }],
      }), { status: 200, headers: { "Content-Type": "application/json" } }));
    vi.stubGlobal("fetch", fetchMock);

    const [greatRunes, crystalTears] = await Promise.all([
      getGreatRunes(),
      getCrystalTears(),
    ]);

    expect(greatRunes.data[0]?.iconUrl)
      .toBe("http://localhost:3000/api/assets/icons/3201");
    expect(crystalTears.data[0]?.iconUrl)
      .toBe("http://localhost:3000/api/assets/icons/423");
  });
});
