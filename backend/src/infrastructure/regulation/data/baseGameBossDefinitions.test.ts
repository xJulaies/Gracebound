import { describe, expect, it } from "vitest";
import { baseGameBossDefinitions } from "./baseGameBossDefinitions";

describe("baseGameBossDefinitions", () => {
  it("contains the 177 verified and uniquely identified combat profiles", () => {
    expect(baseGameBossDefinitions).toHaveLength(177);
    expect(
      new Set(baseGameBossDefinitions.map(({ id }) => id)).size,
    ).toBe(baseGameBossDefinitions.length);
    expect(
      new Set(
        baseGameBossDefinitions.map(({ name, npcParamId }) =>
          `${name}:${npcParamId}`,
        ),
      ).size,
    ).toBe(baseGameBossDefinitions.length);
  });

  it("keeps distinct phases and regional combat profiles", () => {
    expect(baseGameBossDefinitions).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "malenia-blade-of-miquella",
          npcParamId: 21200056,
        }),
        expect.objectContaining({
          id: "malenia-goddess-of-rot",
          npcParamId: 21200056,
        }),
        expect.objectContaining({
          id: "fallingstar-beast-46801930",
          npcParamId: 46801930,
        }),
        expect.objectContaining({
          id: "fallingstar-beast-46801940",
          npcParamId: 46801940,
        }),
      ]),
    );
  });

  it("classifies every profile without confusing unknown locations with false values", () => {
    expect(baseGameBossDefinitions.every(({ encounters }) => encounters.length > 0)).toBe(true);
    expect(baseGameBossDefinitions.every(({ rank }) => rank !== null)).toBe(true);
    expect(baseGameBossDefinitions.every(({ progression }) => progression !== null)).toBe(true);
    expect(baseGameBossDefinitions.filter(({ rewardsGreatRune }) => rewardsGreatRune)).toHaveLength(7);
    expect(baseGameBossDefinitions.filter(({ rewardsRemembrance }) => rewardsRemembrance)).toHaveLength(15);
    expect(baseGameBossDefinitions.filter(({ progression }) => progression === "required")).toHaveLength(9);
    expect(baseGameBossDefinitions.every(({ encounters }) =>
      encounters.every(({ region }) => region.length > 0))).toBe(true);
  });

  it("preserves multiple encounters that share one combat profile", () => {
    const nightsCavalry = baseGameBossDefinitions.find(
      ({ id }) => id === "nights-cavalry-31500020",
    );

    expect(nightsCavalry?.encounters).toEqual([
      expect.objectContaining({ location: "Gate Town Bridge", region: "liurnia" }),
      expect.objectContaining({ location: "Bellum Church", region: "liurnia" }),
    ]);
  });

  it("uses corrected location categories for open-world and cave encounters", () => {
    const smarag = baseGameBossDefinitions.find(
      ({ id }) => id === "glintstone-dragon-smarag",
    );
    const putridCrystalian = baseGameBossDefinitions.find(
      ({ id }) => id === "putrid-crystalian-ringblade",
    );

    expect(smarag?.encounters[0]?.locationType).toBe("open-world");
    expect(putridCrystalian?.encounters[0]?.locationType).toBe("cave");
  });
});
