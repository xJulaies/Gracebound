import { describe, expect, it } from "vitest";
import type { Boss } from "../types/boss.types";
import { formatBossSelectionLabel } from "./formatBossSelectionLabel";

describe("formatBossSelectionLabel", () => {
  it("includes encounter and health context for unique bosses", () => {
    const boss = createBoss("margit", "Margit, the Fell Omen", "Stormveil Castle", "limgrave", 4174);
    expect(formatBossSelectionLabel(boss)).toBe(
      "Margit, the Fell Omen — Stormveil Castle · Limgrave · 4,174 HP",
    );
  });

  it("adds encounter and health context to repeated bosses", () => {
    const liurnia = createBoss("hunter-liurnia", "Bell Bearing Hunter", "Church of Vows", "liurnia", 6195);

    expect(formatBossSelectionLabel(liurnia)).toBe(
      "Bell Bearing Hunter — Church of Vows · Liurnia · 6,195 HP",
    );
  });

  it("uses the region when a precise location is unavailable", () => {
    const second = createBoss("deathbird-altus", "Deathbird", null, "altus-plateau", 7921);

    expect(formatBossSelectionLabel(second)).toBe(
      "Deathbird — Altus Plateau · 7,921 HP",
    );
  });
});

function createBoss(
  id: string,
  name: string,
  location: string | null,
  region: Boss["encounters"][number]["region"],
  health: number,
): Boss {
  return {
    id,
    name,
    imageUrl: null,
    encounters: [{ region, location, locationType: null }],
    rank: null,
    progression: null,
    rewardsGreatRune: null,
    rewardsRemembrance: null,
    health,
    defense: { physical: 100, magic: 100, fire: 100, lightning: 100, holy: 100 },
    absorption: {
      physical: { standard: 0, slash: 0, strike: 0, pierce: 0 },
      magic: 0,
      fire: 0,
      lightning: 0,
      holy: 0,
    },
    gameVersion: "1.17.0",
  };
}
