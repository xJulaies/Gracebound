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
});
